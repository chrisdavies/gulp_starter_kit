// html and html:release build the html and ejs files
var gulp = require('gulp'),
    ejs = require('gulp-ejs'),
    addsrc = require('gulp-add-src'),
    gulpif = require('gulp-if'),
    minifyHtml = require('gulp-minify-html'),
    connect = require('gulp-connect'),
    config = require('../config');

gulp.task('html', function() {
  return buildHtml();
});

gulp.task('html:release', ['css:release', 'js:release'], function () {
  return buildHtml({ minify: true });
});

function buildHtml(options) {
  options = options || {};

  return gulp.src(config.src.ejs)
    .pipe(ejs({ scope: { } }))
    .pipe(addsrc(config.src.html))
    .pipe(gulpif(options.minify, minifyHtml()))
    .pipe(gulp.dest(config.dest.html))
    .pipe(connect.reload());
}
