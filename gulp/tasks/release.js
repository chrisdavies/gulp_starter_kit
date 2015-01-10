// release is for building production-ready content
// this will minify, and all that jazz

var gulp = require('gulp');

gulp.task('release', ['build:release', 'serve']);
