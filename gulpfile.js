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
  handlebars = require('gulp-compile-handlebars');

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
      batch : ['./src/partials'],
      helpers : { }
    };

  return gulp.src(['./src/**/*.{html,handlebars}', '!./src/partials/**/*'], { base: './src' })
    .pipe(plumber())
    .pipe(gulpif('*.handlebars', handlebars(templateData, templateOptions)))
    .pipe(rename({ extname: '.html' }))
    .pipe(htmlmin())
    .pipe(hashSrc({ build_dir: './dist', src_path: './src' }))
    .pipe(gulp.dest('./dist'));
});

/*
  gulpJs concatenates JS files in the specified
  source directories, and outputs them to the
  specified file name.
*/
function gulpJs(srcPaths, destFileName) {
  return gulp.src(srcPaths)
    .pipe(sourcemaps.init())
    .pipe(concat(destFileName))
    // mangle breaks source maps (a bug w/ uglifier)
    .pipe(uglify({ mangle: false }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/js'));
}

gulp.task('vendorjs', function () {
  return gulpJs('./src/js/vendor/**/*.js', 'vendor.js');
});

gulp.task('appjs', function () {
  return gulpJs(['./src/js/**/*.js', '!./src/js/vendor/**/*.js'], 'app.js');
});

/*
 sass compiles the sass/scss files.
 It first creates an internal source map, because
 autoprefixer and csswring don't seem to work well
 with external source maps. Finally, we externalize
 the source maps.
*/
gulp.task('sass', function () {
  gulp.src('./src/scss/**/*.scss')
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
    .pipe(gulp.dest('./dist/css'));
});

// clean cleans the dist directory
gulp.task('clean', function (cb) {
  return del(['./dist/*'], cb);
});

// connect sets up the server/live reload shtuffs
gulp.task('connect', function() {
  return connect.server({
    root: './dist',
    livereload: true
  });
});

// refreshbrowser tells connect to refresh all connected browsers
gulp.task('refreshbrowser', function () {
  connect.reload();
});

// default is what runs when you just type "grunt" with no params
gulp.task('default', ['clean', 'connect', 'html'], function () {
  gulp.watch('./src/**/*.{js,html,handlebars}', ['html', 'refreshbrowser']);
  gulp.watch('./src/**/*.scss', ['sass', 'refreshbrowser']);
});
