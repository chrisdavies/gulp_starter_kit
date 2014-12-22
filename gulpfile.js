var gulp = require('gulp'),
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  htmlmin = require('gulp-htmlmin'),
  clean = require('gulp-clean'),
  hash_src = require('gulp-hash-src'),
  useref = require('gulp-useref'),
  gulpif = require('gulp-if'),
  uglify = require('gulp-uglify'),
  minifyCss = require('gulp-minify-css');

gulp.task('html', ['sass'], function ()
{
  var assets = useref.assets();

  return gulp.src('./src/**/*.html')
    .pipe(htmlmin())
    .pipe(assets)
    .pipe(gulpif('*.js', uglify()))
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(hash_src({ build_dir: './dest', src_path: './src' }))
    .pipe(gulp.dest('./dest'));
});

gulp.task('sass', function () {
  gulp.src('./src/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dest/css'));
});

gulp.task('clean', function () {
  return gulp.src('./dest', { read: false })
    .pipe(clean());
});

gulp.task('default', ['html']);

// gulp-concat
// gulp-uglify
// gulp-watch
// gulp-autoprefixer
// gulp-plumber


//     useref = require('gulp-useref'),
//     gulpif = require('gulp-if'),
//     uglify = require('gulp-uglify'),
//     minifyCss = require('gulp-minify-css');
//
// gulp.task('html', function () {
//     var assets = useref.assets();
//
//     return gulp.src('app/*.html')
//         .pipe(assets)
//         .pipe(gulpif('*.js', uglify()))
//         .pipe(gulpif('*.css', minifyCss()))
//         .pipe(assets.restore())
//         .pipe(useref())
//         .pipe(gulp.dest('dist'));
// });
