// This gulpfile is a total rip off of this:
// https://github.com/greypants/gulp-starter

var requireDir = require('require-dir');

// Require all tasks in gulp/tasks, including subfolders
requireDir('./gulp/tasks', { recurse: true });
