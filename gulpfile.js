/*
  Imports
*/

var gulp = require('gulp'),
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  htmlmin = require('gulp-htmlmin'),
  clean = require('gulp-clean'),
  hash_src = require('gulp-hash-src'),
  useref = require('gulp-useref'),
  gulpif = require('gulp-if'),
  uglify = require('gulp-uglify'),
  minifyCss = require('gulp-minify-css'),
  autoprefixer = require('gulp-autoprefixer'),
  rename = require('gulp-rename'),
  plumber = require('gulp-plumber'),
  connect = require('gulp-connect'),
  handlebars = require('gulp-compile-handlebars');

/*
  Delete ./dist
  Build to ./dist
  Reload in browser
*/

// html process html files and minifies js
gulp.task('html', ['sass'], function ()
{
  var assets = useref.assets(),
    templateData = { },
    options = {
      ignorePartials: true,
      partials : { },
      batch : ['./src/partials'],
      helpers : { }
    };

  return gulp.src(['./src/**/*.{html,handlebars}', '!./src/partials/**/*'], { base: './src' })
    //.pipe(plumber())
    .pipe(gulpif('*.handlebars', handlebars(templateData, options)))
    .pipe(rename({ extname: '.html' }))
    .pipe(htmlmin())
    .pipe(assets)
    // .pipe(gulpif('*.js', uglify({
    //   sourceMap: true,
    //   sourceMapName: 'dist/<%= pkg.name %>-<%= pkg.version %>.map'
    // })))
    .pipe(assets.restore())
    .pipe(useref())
    //.pipe(hash_src({ build_dir: './dist', src_path: './src' }))
    .pipe(gulp.dest('./dist'))
    .pipe(connect.reload());
});

// sass compiles the sass files
gulp.task('sass', function () {
  return gulp.src('./src/scss/**/*.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('./dist/css'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifyCss())
    .pipe(gulp.dest('./dist/css'))
    .pipe(connect.reload());
});

// clean cleans the dist directory
gulp.task('clean', function () {
  return gulp.src('./dist', { read: false })
    .pipe(clean());
});

gulp.task('connect', function() {
  return connect.server({
    root: './dist',
    livereload: true
  });
});

// default is the default grunt task
gulp.task('default', ['connect', 'html'], function () {
  gulp.watch('./src/**/*.{js,html,handlebars}', ['html']);
  gulp.watch('./src/**/*.scss', ['sass']);
});
