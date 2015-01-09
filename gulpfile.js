/*
  The gulp build process is as follows:

  "gulp" runs in debug mode and serves out of the
  "build" directory

  "gulp release" creates an optimized build in the
  "release" directory

  "gulp release --minonly" same as "gulp release" except
  that it expects all sources to be referenced via gulp-usemin
  references, so it doesn't copy js or css to the "release"
  directory.

  "gulp test" runs all qunit tests in the test directory

  "gulp watchTests" run tests any time any tests change
*/

// Load all the required plugins
var gulp = require('gulp'),
  sass = require('gulp-sass'),
  watch = require('gulp-watch'),
  jshint = require('gulp-jshint'),
  connect = require('gulp-connect'),
  minifyCss = require('gulp-minify-css'),
  minifyHtml = require('gulp-minify-html'),
  hashSrc = require('gulp-hash-src'),
  handlebars = require('gulp-static-handlebars'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  gulpif = require('gulp-if'),
  del = require('del'),
  argv = require('yargs').argv,
  rev = require('gulp-rev'),
  usemin = require('gulp-usemin'),
  order = require('gulp-order'),
  glob = require('glob'),
  autoprefixer = require('gulp-autoprefixer'),
  inject = require('gulp-inject'),
  qunit = require('./gulp/qunit'),
  deploy = require('gulp-gh-pages');

// srcDir is the source directory
var srcDir = './src',
  destDir = './dist';

// src holds the values of source folders
var src = {
  sass:    srcDir + '/css/**/*.scss',
  scripts: srcDir + '/js/**/*.js',
  images:  srcDir + '/img/**/*',
  fonts:   srcDir + '/fonts/**/*',
  html:    srcDir + '/**/*.html',
  tests:   './test/**/*',
  vendorScripts: srcDir + '/js/vendor/**/*.js'
};

// dest holds the values of desination folders
var dest = {
  sass:    destDir + '/css',
  scripts: destDir + '/js',
  images:  destDir + '/img',
  fonts:   destDir + '/fonts',
  html:    destDir
};


// default builds, serves, and watches /src into /dist
gulp.task('default', ['build:dev', 'serve', 'watch']);


// test runs qunit tests from the /test directory
gulp.task('test', function(done) {
  qunit(glob.sync(src.tests + '.html'), done);
});


// test:watch runs tests continually as js files change
gulp.task('test:watch', ['test'], function() {
  gulp.watch([src.tests, src.scripts], ['test']);
});


// build:dev builds in local development mode
gulp.task('build:dev', ['assets', 'css', 'js', 'html']);


// watch watches the /src directory for changes and
// launches the appropriate task
gulp.task('watch', function () {
  gulp.watch([src.fonts, src.images], ['assets']);
  gulp.watch(src.sass, ['css']);
  gulp.watch(src.scripts, ['js']);
  gulp.watch(src.html, ['html']);
});


// serve serves files from the /dist directory
gulp.task('serve', function () {
  connect.server({
    root: 'dist',
    port: 8000,
    livereload: true
  });
});


// js processes javascript files for dev-builds
gulp.task('js', function() {
  var notVendorScript = '!' + src.vendorScripts;

  gulp.src([src.scripts, notVendorScript])
    .pipe(jshint())
    .pipe(jshint.reporter(''));

  return gulp.src(src.scripts)
    .pipe(gulp.dest(dest.scripts))
    .pipe(connect.reload());
});


// css runs scss preprocessing and distributes to
// the dest folder
gulp.task('css', function() {
  return gulp.src(src.sass)
    .pipe(sass())
    .pipe(gulp.dest(dest.sass))
    .pipe(connect.reload());
});


// html moves html files to the /dest directory and
// injects JS into them using gulp-inject
gulp.task('html', function() {
  var jsOrder = require('./gulp/jsorder');

  var jsFiles = gulp.src(src.scripts, { read: false })
    .pipe(order(jsOrder));

  return gulp.src(src.html)
    .pipe(inject(jsFiles, { relative: true }))
    .pipe(gulp.dest(dest.html))
    .pipe(connect.reload());
});


// assets copies static assests (images, fonts, etc)
gulp.task('assets', ['fonts', 'img']);


// fonts copies fonts to the destination
gulp.task('fonts', function () {
  return gulp.src(src.fonts)
    .pipe(gulp.dest(dest.fonts));
});


// img copies images to the destination
gulp.task('img', function () {
  return gulp.src(src.images)
    .pipe(gulp.dest(dest.images));
});
