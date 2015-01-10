// gulpstart is a convenience method to create a callback
// that runs a specified gulp task
var gulp = require('gulp');

module.exports = function (task) {
  return function () {
    gulp.start(task);
  }
}
