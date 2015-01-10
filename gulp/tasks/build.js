// build:dev builds the dev (debuggable) mode
// build:release builds the release (minified) mode

var gulp = require('gulp');

gulp.task('build:dev', ['clean'], function () {
  return gulp.start('assets', 'js', 'css', 'html');
});

gulp.task('build:release', ['clean'], function () {
  return gulp.start('assets', 'html:release', 'bust-cache');
});
