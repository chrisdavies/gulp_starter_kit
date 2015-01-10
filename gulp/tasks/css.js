// css and css:release builds the css files

var gulp = require('gulp'),
    connect = require('gulp-connect'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    gulpif = require('gulp-if'),
    minifyCss = require('gulp-minify-css'),
    config = require('../config');

gulp.task('css:release', function () {
  return buildCss({ minify: true });
});

gulp.task('css', function () {
  return buildCss()
    .pipe(connect.reload());
});

function buildCss(options) {
  options = options || {};

  return gulp.src(config.src.css)
    .pipe(sass())
    .on('error', function(err){
      console.log(err);
      this.emit('end');
    })
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulpif(options.minify, minifyCss()))
    .pipe(gulp.dest(config.dest.css));
}
