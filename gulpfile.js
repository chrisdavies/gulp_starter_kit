/*
  Options/parameters
*/
var paths = {
  src: './src',
  dest: './dist'
};

/*
  Imports
*/
var gulp = require('gulp'),
  sass = require('gulp-sass'),
  postcss = require('gulp-postcss'),
  concat = require('gulp-concat'),
  order = require('gulp-order'),
  csswring = require('csswring'),
  sourcemaps = require('gulp-sourcemaps'),
  minifyCss = require('gulp-minify-css'),
  autoprefixer = require('gulp-autoprefixer'),
  htmlmin = require('gulp-htmlmin'),
  del = require('del'),
  hashSrc = require('gulp-hash-src'),
  useref = require('gulp-useref'),
  gulpif = require('gulp-if'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  plumber = require('gulp-plumber'),
  connect = require('gulp-connect'),
  handlebars = require('gulp-compile-handlebars'),
  argv = require('yargs').argv;

/*
  Helper functions
*/
function refreshBrowser () {
  gulp.src(paths.src)
    .pipe(connect.reload());
}

/*
  html process html/handlebars files, concats, minifies js,
  and hashes the src/href attribute values
*/
gulp.task('html', ['sass', 'vendorjs', 'appjs'], function ()
{
  var templateData = { },
    templateOptions = {
      ignorePartials: true,
      partials : { },
      batch : [paths.src + '/partials'],
      helpers : { }
    };

  return gulp.src([paths.src + '/**/*.{html,handlebars}', '!' + paths.src + '/partials/**/*'], { base: paths.src })
    .pipe(plumber())
    .pipe(gulpif('*.handlebars', handlebars(templateData, templateOptions)))
    .pipe(rename({ extname: '.html' }))
    .pipe(htmlmin())
    .pipe(hashSrc({ build_dir: paths.dest, src_path: paths.src }))
    .pipe(gulp.dest(paths.dest))
    .pipe(connect.reload());
});

/*
  gulpJs concatenates JS files in the specified
  source directories, and outputs them to the
  specified file name.
*/
function gulpJs(srcPaths, destFileName) {
  return gulp.src(srcPaths)
    .pipe(gulpif(!argv.release, sourcemaps.init()))
    .pipe(concat(destFileName))
    // mangle breaks source maps (a bug w/ uglifier)
    .pipe(uglify({ mangle: argv.release }))
    .pipe(gulpif(!argv.release, sourcemaps.write('.')))
    .pipe(gulp.dest(paths.dest + '/js'));
}

gulp.task('vendorjs', function () {
  return gulpJs(paths.src + '/js/vendor/**/*.js', 'vendor.js');
});

gulp.task('appjs', function () {
  return gulpJs([paths.src + '/js/**/*.js', '!' + paths.src + '/js/vendor/**/*.js'], 'app.js');
});

/*
 sass compiles the sass/scss files.
 It first creates an internal source map, because
 autoprefixer and csswring don't seem to work well
 with external source maps. Finally, we externalize
 the source maps.
*/
gulp.task('sass', function () {
  return gulp.src(paths.src + '/scss/**/*.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(postcss([csswring]))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dest + '/css'));
});

// clean cleans the dist directory
gulp.task('clean', function (cb) {
  return del([paths.dest + '/*'], cb);
});

// build cleans, builds, and launches a server
gulp.task('build', ['clean'], function () {
  console.log('hello world' + argv.release);

  gulp.start('html', 'connect');
});

// connect sets up the server/live reload shtuffs
gulp.task('connect', function() {
  return connect.server({ root: paths.dest, livereload: true });
});

// reload sass
gulp.task('reload-sass', ['sass'], refreshBrowser);

// reload html/js
gulp.task('reload-html', ['html'], refreshBrowser);

// default is what runs when you just type "grunt" with no params
gulp.task('default', ['build'], function () {
  gulp.watch(paths.src + '/**/*.{js,html,handlebars}', ['reload-html']);
  gulp.watch(paths.src + '/**/*.scss', ['reload-sass']);
});
