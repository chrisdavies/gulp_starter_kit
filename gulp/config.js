// Build configuration, defining source and destination
// directories and patterns
// // srcDir is the source directory

var srcDir = './src',
    destDir = './dist';

// src holds the values of source folders
var src = {
  root:     srcDir,
  css:      srcDir + '/css/**/*.scss',
  js:       srcDir + '/js/**/*.js',
  img:      srcDir + '/img/**/*',
  fonts:    srcDir + '/fonts/**/*',
  html:     srcDir + '/**/*.html',
  ejs:      [srcDir + '/**/*.ejs', '!' + srcDir + '/**/_*.ejs'],
  tests:    './test/**/*',
  vendorJs: srcDir + '/js/vendor/**/*.js'
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

module.exports = {
  src: src,
  dest: dest
};
