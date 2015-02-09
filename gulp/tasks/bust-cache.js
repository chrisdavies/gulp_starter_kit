// bust-cache hashes urls

var gulp = require('gulp'),
    hashSrc = require('gulp-hash-src'),
    config = require('../config');

gulp.task('bust-cache', ['html:release'], function () {
  // return gulp.src(config.dest.root + '/**.*html')
  //   .pipe(hashSrc({
  //     build_dir: config.dest.root,
  //     src_path: config.src.root
  //   }))
  //   .pipe(gulp.dest(config.dest.root));
});
