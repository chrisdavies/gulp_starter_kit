/*
  Options/parameters
*/
var paths = {
  src: './src',
  dest: './dist'
};

/*
  Imports
*/
var gulp = require('gulp'),
  sass = require('gulp-sass'),
  postcss = require('gulp-postcss'),
  concat = require('gulp-concat'),
  order = require('gulp-order'),
  csswring = require('csswring'),
  sourcemaps = require('gulp-sourcemaps'),
  minifyCss = require('gulp-minify-css'),
  autoprefixer = require('gulp-autoprefixer'),
  htmlmin = require('gulp-htmlmin'),
  del = require('del'),
  hashSrc = require('gulp-hash-src'),
  gulpif = require('gulp-if'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  plumber = require('gulp-plumber'),
  connect = require('gulp-connect'),
  handlebars = require('gulp-compile-handlebars'),
  argv = require('yargs').argv,
  fs = require('fs'),
  glob = require('glob'),
  path = require('path'),
  Zombie = require('zombie'),
  colors = require('colors/safe');

/*
  Helper functions
*/
function refreshBrowser() {
  gulp.src(paths.src)
    .pipe(connect.reload());
}

/*
  html process html/handlebars files, concats, minifies js,
  and hashes the src/href attribute values
*/
gulp.task('html', ['copy-assests', 'sass', 'vendorjs', 'appjs'], function() {
  var partialsPath = paths.src + '/partials',
    templateData = {},
    templateOptions = {
      ignorePartials: true,
      partials: {},
      batch: fs.existsSync(partialsPath) ? [partialsPath] : [],
      helpers: {}
    };

  return gulp.src([paths.src + '/**/*.{html,handlebars}', '!' + paths.src + '/partials/**/*'], {
      base: paths.src
    })
    .pipe(plumber())
    .pipe(gulpif('*.handlebars', handlebars(templateData, templateOptions)))
    .pipe(rename({
      extname: '.html'
    }))
    .pipe(htmlmin())
    .pipe(hashSrc({
      build_dir: paths.dest,
      src_path: paths.src
    }))
    .pipe(gulp.dest(paths.dest))
    .pipe(connect.reload());
});

/*
  gulpJs concatenates JS files in the specified
  source directories, and outputs them to the
  specified file name.
*/
function gulpJs(srcPaths, destFileName) {
  return gulp.src(srcPaths)
    .pipe(gulpif(!argv.release, sourcemaps.init()))
    .pipe(concat(destFileName))
    // mangle breaks source maps (a bug w/ uglifier)
    .pipe(uglify({
      mangle: argv.release
    }))
    .pipe(gulpif(!argv.release, sourcemaps.write('.')))
    .pipe(gulp.dest(paths.dest + '/js'));
}

gulp.task('vendorjs', function() {
  return gulpJs(paths.src + '/js/vendor/**/*.js', 'vendor.js');
});

gulp.task('appjs', function() {
  return gulpJs([paths.src + '/js/**/*.js', '!' + paths.src + '/js/vendor/**/*.js'], 'app.js');
});

/*
 sass compiles the sass/scss files.
 It first creates an internal source map, because
 autoprefixer and csswring don't seem to work well
 with external source maps. Finally, we externalize
 the source maps.
*/
gulp.task('sass', function() {
  return gulp.src(paths.src + '/scss/**/*.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(postcss([csswring]))
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dest + '/css'));
});

// clean cleans the dist directory
gulp.task('clean', function(cb) {
  return del([paths.dest + '/*'], cb);
});

// build cleans, builds, and launches a server
gulp.task('build', ['clean'], function() {
  gulp.start('html', 'connect');
});

// connect sets up the server/live reload shtuffs
gulp.task('connect', function() {
  return connect.server({
    root: paths.dest,
    livereload: true
  });
});

// copy static assets out to the dest directory
gulp.task('copy-assests', function() {
  gulp.src([paths.src + '/fonts/**/*']).pipe(gulp.dest(paths.dest + '/fonts'));
  gulp.src([paths.src + '/img/**/*']).pipe(gulp.dest(paths.dest + '/img'));
});

// reload sass
gulp.task('reload-sass', ['sass'], refreshBrowser);

// reload html/js
gulp.task('reload-html', ['html'], refreshBrowser);

// qunit runs all qunit tests
// qunit runs all qunit tests
gulp.task('qunit', function(done) {
  var files = glob.sync('./test/**/*.html');
  runAllQunits(files);

  function runAllQunits(testFiles) {
    var browser = new Zombie();

    function errorTrace(errorNode, selector) {
      console.log(colors.yellow((errorNode.querySelector(selector) || {}).textContent));
    }

    function printErrors() {
      var errors = browser.document.querySelectorAll('#qunit-tests > .fail');
      Array.prototype.slice.call(errors, 0).forEach(function (error) {
        errorTrace(error, '.test-name');
        errorTrace(error, '.test-message');
        errorTrace(error, '.test-source');
      });
    }

    function printQunitResults() {
      var passed = browser.document.querySelector('#qunit-testresult .failed').textContent.trim() === '0',
        color = passed ? 'green' : 'red',
        text = browser.document.querySelector('#qunit-testresult').textContent;

      !passed && printErrors();

      console.log(colors[color](text));
      return text;
    }

    function cleanUp() {
      browser.close();
      done();
    }

    function testFile(file) {
      var url = 'file:/' + path.resolve(file);

      console.log('Running ' + file);

      browser.visit(url).then(printQunitResults).then(next);
    }

    function queueTest() {
      setTimeout(function () {
        testFile(testFiles.pop());
      });
    }

    function next() {
      if (testFiles.length) {
        queueTest();
      } else {
        cleanUp();
      }
    }

    next();
  }
});

// default is what runs when you just type "grunt" with no params
gulp.task('default', ['build'], function() {
  gulp.watch(paths.src + '/**/*.{js,html,handlebars}', ['reload-html']);
  gulp.watch(paths.src + '/**/*.scss', ['reload-sass']);
});
