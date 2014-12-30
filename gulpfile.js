/*
  The gulp build process is as follows:

  "gulp" runs in debug mode and serves out of the
  "build" directory

  "gulp release" creates an optimized build in the
  "release" directory
*/

/* Load plugins */
var gulp = require('gulp'),
  sass = require('gulp-sass'),
  watch = require('gulp-watch'),
  jshint = require('gulp-jshint'),
  connect = require('gulp-connect'),
  cssmin = require('gulp-cssmin'),
  minifyhtml = require('gulp-minify-html'),
  hashSrc = require('gulp-hash-src'),
  inlinesource = require('gulp-inline-source'),
  handlebars = require('gulp-static-handlebars'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  gulpif = require('gulp-if'),
  del = require('del'),
  glob = require('glob');

/********************************************************
  Debug/build tasks
*********************************************************/

/* Serve the build directory */
gulp.task('serveBuild', function() {
  connect.server({
    root: 'build',
    port: 8000,
    livereload: true
  });
});

/* Cleans the build directory */
gulp.task('cleanBuild', function(cb) {
  del('./build', cb);
});

/* Copy static assets to the build directory */
gulp.task('assets', function() {
  gulp.src('./src/fonts/**/*')
    .pipe(gulp.dest('./build/fonts'));

  gulp.src('./src/img/**/*')
    .pipe(gulp.dest('./build/img'));
});

/* Process scss and copy to the css build directory */
gulp.task('css', function() {
  return gulp.src('./src/scss/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./build/css'))
    .pipe(connect.reload());
});

/* Process js and copy to the js build directory */
gulp.task('js', function() {
  gulp.src(['./src/js/**/*.js', '!./src/js/vendor/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));

  return gulp.src('./src/js/**/*.js')
    .pipe(gulp.dest('./build/js'))
    .pipe(connect.reload());
});

/* Process handlebars templates and build into html */
gulp.task('hbs', function() {
  var hbs = {
    content: {},
    options: {
      helpers: gulp.src('./src/helpers/**/*.js'),
      partials: gulp.src('./src/partials/**/*.hbs')
    }
  };

  return gulp.src(['./src/**/*.hbs', '!./src/partials/**/*.hbs'])
    .pipe(handlebars(hbs.content, hbs.options))
    .pipe(rename({
      extname: '.html'
    }))
    .pipe(gulp.dest('./build'))
    .pipe(connect.reload());
});

/* Move html into the build directory */
gulp.task('html', function() {
  return gulp.src('./src/**/*.html')
    .pipe(gulp.dest('./build'))
    .pipe(connect.reload());
});


/**********************************************************
  Release tasks
***********************************************************/

/* Serve the release directory */
gulp.task('serveRelease', function() {
  connect.server({
    root: 'release',
    port: 8000
  });
});

/* Copy static assets to the release directory */
gulp.task('releaseAssets', ['assets'], function() {
  gulp.src('./build/fonts/**/*')
    .pipe(gulp.dest('./release/fonts'));

  gulp.src('./build/img/**/*')
    .pipe(gulp.dest('./release/img'));
});

/* Optimize JS files */
gulp.task('minifyjs', ['js'], function() {
  return gulp.src('./build/js/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./release/js'));
});

/* Optimize CSS files */
gulp.task('minifycss', ['css'], function() {
  return gulp.src('./build/css/**/*.css')
    .pipe(cssmin())
    .pipe(gulp.dest('./release/css'));
});

/* Optimize HTML files */
gulp.task('minifyhtml', ['hbs', 'html'], function() {
  return gulp.src('./build/**/*.html')
    .pipe(inlinesource({
      compress: true
    }))
    .pipe(minifyhtml())
    .pipe(hashSrc({
      build_dir: './release',
      src_path: './build'
    }))
    .pipe(gulp.dest('./release'));
});

/* clean cleans the release directory */
gulp.task('cleanRelease', function(cb) {
  del('./release', cb);
});

/***************************************************
  Build commands
****************************************************/

/*
  Default task, no optimizations, serves from the 'build'
  directory
*/
gulp.task('default', ['serveBuild', 'build', 'watch']);

/*
  Debug build, no optimizations, builds to the
  'build' directory
*/
gulp.task('build', ['cleanBuild'], function () {
  return gulp.start('assets', 'js', 'css', 'hbs', 'html');
});

/*
  Release build, optimizes sources and serves from
  the 'release' directory
*/
gulp.task('release', ['serveRelease', 'cleanBuild', 'cleanRelease'], function() {
  return gulp.start('releaseAssets', 'minifyjs', 'minifycss', 'minifyhtml');
});

/* Watch task */
gulp.task('watch', function() {
  gulp.watch(['./src/fonts/**/*', './src/img/**/*'], ['assets']);
  gulp.watch('./src/scss/**/*.scss', ['css']);
  gulp.watch('./src/js/**/*.js', ['js']);
  gulp.watch('./src/**/*.html', ['html']);
  gulp.watch('./src/**/*.hbs', ['hbs']);
});
