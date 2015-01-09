/*
  The gulp build process is as follows:

  "gulp" runs in debug mode and serves out of the
  "build" directory

  "gulp release" creates an optimized build in the
  "release" directory

  "gulp release --minonly" same as "gulp release" except
  that it expects all sources to be referenced via gulp-usemin
  references, so it doesn't copy js or css to the "release"
  directory.

  "gulp test" runs all qunit tests in the test directory

  "gulp watchTests" run tests any time any tests change
*/

// Load plugins
var gulp = require('gulp'),
  ejs = require('gulp-ejs'),
  sass = require('gulp-sass'),
  monocle = require('monocle'),
  jshint = require('gulp-jshint'),
  connect = require('gulp-connect'),
  concat = require('gulp-concat'),
  minifyCss = require('gulp-minify-css'),
  minifyHtml = require('gulp-minify-html'),
  hashSrc = require('gulp-hash-src'),
  uglify = require('gulp-uglify'),
  gulpif = require('gulp-if'),
  del = require('del'),
  glob = require('glob'),
  autoprefixer = require('gulp-autoprefixer'),
  qunit = require('./gulp/qunit'),
  deploy = require('gulp-gh-pages'),
  merge = require('merge-stream'),
  sourcemaps = require('gulp-sourcemaps'),
  addsrc = require('gulp-add-src');

// srcDir is the source directory
var srcDir = './src',
  destDir = './dist';

// src holds the values of source folders
var src = {
  sass:    srcDir + '/css/**/*.scss',
  scripts: srcDir + '/js/**/*.js',
  images:  srcDir + '/img/**/*',
  fonts:   srcDir + '/fonts/**/*',
  html:    srcDir + '/**/*.html',
  ejs:     [srcDir + '/**/*.ejs', '!' + srcDir + '/**/_*.ejs'],
  tests:   './test/**/*',
  vendorScripts: srcDir + '/js/vendor/**/*.js'
};

// dest holds the values of desination folders
var dest = {
  sass:    destDir + '/css',
  scripts: destDir + '/js',
  images:  destDir + '/img',
  fonts:   destDir + '/fonts',
  html:    destDir
};


// default builds, serves, and watches /src into /dist
gulp.task('default', ['build:dev', 'serve', 'watch']);


// release builds and serves production ready content
gulp.task('release', ['build:release', 'serve']);


// test runs qunit tests from the /test directory
gulp.task('test', function(done) {
  qunit(glob.sync(src.tests + '.html'), done);
});


// test:watch runs tests continually as js files change
gulp.task('test:watch', ['test'], function() {
  gulp.watch([src.tests, src.scripts], ['test']);
});


// build:dev builds in local development mode
gulp.task('build:dev', ['clean'], function () {
  return gulp.start('assets', 'js', 'css', 'html');
});

// build:release builds production-ready content
gulp.task('build:release', ['clean'], function () {
  return gulp.start('assets', 'html:release', 'bust-cache');
});

// css:release builds and minifies scss
gulp.task('css:release', function () {
  return buildCss({ minify: true });
});

gulp.task('css', function () {
  return buildCss()
    .pipe(connect.reload());
});

function buildCss(options) {
  options = options || {};

  return gulp.src(src.sass)
    .pipe(sass())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulpif(options.minify, minifyCss()))
    .pipe(gulp.dest(dest.sass));
}


// html moves html files to the /dest directory and
// injects JS into them using gulp-inject
gulp.task('html', function() {
  return buildHtml();
});

gulp.task('html:release', ['css:release', 'js:release'], function () {
  return buildHtml({ minify: true });
});

function buildHtml(options) {
  options = options || {};

  return gulp.src(src.ejs)
    .pipe(ejs({ scope: { } }))
    .pipe(addsrc(src.html))
    .pipe(gulpif(options.minify, minifyHtml()))
    .pipe(gulp.dest(dest.html))
    .pipe(connect.reload());
}


// bust-cache hashes urls
gulp.task('bust-cache', ['html:release'], function () {
  return gulp.src(destDir + '/**.*html')
    .pipe(hashSrc({ build_dir: destDir, src_path: srcDir }))
    .pipe(gulp.dest(destDir));
});


// watch watches the /src directory for changes and
// launches the appropriate task
gulp.task('watch', function () {
  var watch = require('./gulp/watch');

  function gulpStart(task) {
    return function () {
      gulp.start(task);
    }
  }

  watch({
    root: srcDir,
    match: [{
      when: 'js/**',
      then: gulpStart('js')
    }, {
      when: '+(scss|css)/**',
      then: gulpStart('css')
    }, {
      when: '+(fonts|img)/**',
      then: gulpStart('assets')
    }, {
      when: '*.+(html|ejs)',
      then: gulpStart('html')
    }]
  });
});


// serve serves files from the /dist directory
gulp.task('serve', function () {
  connect.server({
    root: 'dist',
    port: 8000,
    livereload: true
  });
});


// js processes javascript files for dev-builds
gulp.task('js', function() {
  return buildJs()
    .pipe(connect.reload());
});

gulp.task('js:release', function () {
  return buildJs({ minify: true });
});

function buildJs(options) {
  options = options || {};

  var scriptDefinitions = require('./gulp/script-definitions'),
      scriptNames = Object.keys(scriptDefinitions),
      appScriptNames = scriptNames.filter(function (scriptName) {
        return scriptName !== 'vendor';
      });

  // Grab app scripts, concat, etc
  var result = merge(appScriptNames.map(function (scriptName) {
      return gulp.src(scriptDefinitions[scriptName])
        .pipe(jshint())
        .pipe(jshint.reporter(''))
        .pipe(sourcemaps.init({ base: 'src' }))
        .pipe(concat(scriptName + '.js'))
        .pipe(gulpif(options.minify, uglify()))
        .pipe(sourcemaps.write('./'));
    }));

  // Grab vendor scripts and concat them, if any exist
  if (scriptDefinitions.vendor && scriptDefinitions.vendor.length) {
    result = merge(result, gulp.src(scriptDefinitions.vendor)
      .pipe(concat('vendor.js')));
  }

  // Merge vendor and app scripts into one stream
  return result.pipe(gulp.dest(dest.scripts));
}


// clean cleans the destination directory
gulp.task('clean', function (cb) {
  del(destDir, cb);
});


// assets copies static assests (images, fonts, etc)
gulp.task('assets', ['fonts', 'img']);


// fonts copies fonts to the destination
gulp.task('fonts', function () {
  return gulp.src(src.fonts)
    .pipe(gulp.dest(dest.fonts))
    .pipe(connect.reload());
});


// img copies images to the destination
gulp.task('img', function () {
  return gulp.src(src.images)
    .pipe(gulp.dest(dest.images))
    .pipe(connect.reload());
});


// deploy pushes the contents of dist to gh-pages
gulp.task('deploy', ['clean'], function () {
  return gulp.start('assets', 'html:release', 'bust-cache', 'push-gh-pages');
});


// deploy /dest to github pages
gulp.task('push-gh-pages', ['assets', 'html:release', 'bust-cache'], function () {
  return gulp.src(destDir + '/**/*')
    .pipe(deploy());
});
