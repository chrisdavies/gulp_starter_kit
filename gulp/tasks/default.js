// default builds dev content, unminified, hopefully more
// easy to debug. This build should not be deployed to prod

var gulp = require('gulp');

gulp.task('default', ['build:dev', 'serve', 'watch']);
