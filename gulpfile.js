/*
  Imports
*/

var gulp = require('gulp'),
  sass = require('gulp-sass'),
  postcss = require('gulp-postcss'),
  csswring = require('csswring'),
  sourcemaps = require('gulp-sourcemaps'),
  minifyCss = require('gulp-minify-css'),
  autoprefixer = require('gulp-autoprefixer'),
  htmlmin = require('gulp-htmlmin'),
  del = require('del'),
  hash_src = require('gulp-hash-src'),
  useref = require('gulp-useref'),
  gulpif = require('gulp-if'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  plumber = require('gulp-plumber'),
  connect = require('gulp-connect'),
  handlebars = require('gulp-compile-handlebars');

/*
  Delete ./dist
  Build to ./dist
  Reload in browser
*/

// html process html files and minifies js
gulp.task('html', ['sass'], function ()
{
  var assets = useref.assets(),
    templateData = { },
    options = {
      ignorePartials: true,
      partials : { },
      batch : ['./src/partials'],
      helpers : { }
    };

  return gulp.src(['./src/**/*.{html,handlebars}', '!./src/partials/**/*'], { base: './src' })
    //.pipe(plumber())
    .pipe(gulpif('*.handlebars', handlebars(templateData, options)))
    .pipe(rename({ extname: '.html' }))
    .pipe(htmlmin())
    .pipe(assets)
    // .pipe(gulpif('*.js', uglify({
    //   sourceMap: true,
    //   sourceMapName: 'dist/<%= pkg.name %>-<%= pkg.version %>.map'
    // })))
    .pipe(assets.restore())
    .pipe(useref())
    //.pipe(hash_src({ build_dir: './dist', src_path: './src' }))
    .pipe(gulp.dest('./dist'))
    .pipe(connect.reload());
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

gulp.task('connect', function() {
  return connect.server({
    root: './dist',
    livereload: true
  });
});

// default is the default grunt task
gulp.task('default', ['clean', 'connect', 'html'], function () {
  gulp.watch('./src/**/*.{js,html,handlebars}', ['html']);
  gulp.watch('./src/**/*.scss', ['sass']);
});
