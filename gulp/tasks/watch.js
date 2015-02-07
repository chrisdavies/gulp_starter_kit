// watch watches the /src directory for changes and
// launches the appropriate task

var gulp = require('gulp'),
    watch = require('../util/watch'),
    config = require('../config'),
    gulpStart = require('../util/gulpstart');

gulp.task('watch', function () {
  watch({
    root: config.src.vendorRoot,
    match: [{
      when: '*.js',
      then: gulpStart('js')
    }]
  });

  watch({
    root: config.src.root,
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
      when: '**/*.+(html|ejs)',
      then: gulpStart('html')
    }]
  });
});
