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
  sass = require('gulp-sass'),
  watch = require('gulp-watch'),
  jshint = require('gulp-jshint'),
  connect = require('gulp-connect'),
  concat = require('gulp-concat'),
  minifyCss = require('gulp-minify-css'),
  minifyHtml = require('gulp-minify-html'),
  hashSrc = require('gulp-hash-src'),
  handlebars = require('gulp-static-handlebars'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  gulpif = require('gulp-if'),
  del = require('del'),
  argv = require('yargs').argv,
  rev = require('gulp-rev'),
  spa = require('gulp-spa'),
  order = require('gulp-order'),
  glob = require('glob'),
  autoprefixer = require('gulp-autoprefixer'),
  inject = require('gulp-inject'),
  qunit = require('./gulp/qunit'),
  deploy = require('gulp-gh-pages'),
  addsrc = require('gulp-add-src'),
  htmlReplace = require('gulp-html-replace'),
  merge = require('merge-stream'),
  sourcemaps = require('gulp-sourcemaps');

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
  return buildCss(minifyCss());
});

gulp.task('css', function () {
  return buildCss();
});

function buildCss(postProcessing) {
  var stream = gulp.src(src.sass)
    .pipe(sass())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }));

  if (postProcessing) {
    stream = stream.pipe(postProcessing);
  }

  return stream.pipe(gulp.dest(dest.sass));
}


// html moves html files to the /dest directory and
// injects JS into them using gulp-inject
gulp.task('html', function() {
  return gulp.src(src.html)
    .pipe(gulp.dest(dest.html))
    .pipe(connect.reload());
});

gulp.task('html:release', ['css:release', 'js:release'], function () {
  return gulp.src(src.html)
    .pipe(minifyHtml())
    .pipe(gulp.dest(dest.html));
});


// bust-cache hashes urls
gulp.task('bust-cache', ['html:release'], function () {
  return gulp.src(destDir + '/**.*html')
    .pipe(hashSrc({ build_dir: destDir, src_path: srcDir }))
    .pipe(gulp.dest(destDir));
});


// watch watches the /src directory for changes and
// launches the appropriate task
gulp.task('watch', function () {
  gulp.watch([src.fonts, src.images], ['assets']);
  gulp.watch(src.sass, ['css']);
  gulp.watch(src.scripts, ['js']);
  gulp.watch(src.html, ['html']);
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
  return bulidJs();
});

gulp.task('js:release', function () {
  return bulidJs(uglify());
});

function bulidJs(postProcessing) {
  var scriptDefinitions = require('./gulp/script-definitions'),
      scriptNames = Object.keys(scriptDefinitions),
      appScriptNames = scriptNames.filter(function (scriptName) {
        return scriptName !== 'vendor';
      });

  // Grab app scripts, concat, etc
  var result = merge(appScriptNames.map(function (scriptName) {
      var stream = gulp.src(scriptDefinitions[scriptName])
        .pipe(jshint())
        .pipe(jshint.reporter(''))
        .pipe(sourcemaps.init({ base: 'src' }))
        .pipe(concat(scriptName + '.js'))
        .pipe(sourcemaps.write('./'));

      if (postProcessing) {
        stream = stream.pipe(postProcessing);
      }

      return stream;
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
    .pipe(gulp.dest(dest.fonts));
});


// img copies images to the destination
gulp.task('img', function () {
  return gulp.src(src.images)
    .pipe(gulp.dest(dest.images));
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
