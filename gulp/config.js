// Build configuration, defining source and destination
// directories and patterns
// // srcDir is the source directory

var srcDir = './src',
    destDir = './dist',
    bowerDir = './bower_components';

// src holds the values of source folders
var src = {
  root:     srcDir,
  vendorRoot: bowerDir,
  css:      srcDir + '/css/**/*.scss',
  js:       srcDir + '/js/**/*.js',
  img:      srcDir + '/img/**/*',
  fonts:    srcDir + '/fonts/**/*',
  html:     srcDir + '/**/*.html',
  ejs:      [srcDir + '/**/*.ejs', '!' + srcDir + '/**/_*.ejs'],
  tests:    './test/**/*'
};

// dest holds the values of desination folders
var dest = {
  root:     destDir,
  css:      destDir + '/css',
  js:       destDir + '/js',
  img:      destDir + '/img',
  fonts:    destDir + '/fonts',
  html:     destDir
};

// Export our src and dest configurations so they can
// be used in our gulp tasks
module.exports = {
  src: src,
  dest: dest
};
