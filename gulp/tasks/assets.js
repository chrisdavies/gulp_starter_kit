// assets copies static assests (images, fonts, etc)
var gulp = require('gulp'),
    config = require('../config'),
    connect = require('gulp-connect');

gulp.task('assets', ['fonts', 'img']);

// fonts copies fonts to the destination
gulp.task('fonts', function () {
  return gulp.src(config.src.fonts)
    .pipe(gulp.dest(config.dest.fonts))
    .pipe(connect.reload());
});

// img copies images to the destination
gulp.task('img', function () {
  return gulp.src(config.src.img)
    .pipe(gulp.dest(config.dest.img))
    .pipe(connect.reload());
});
