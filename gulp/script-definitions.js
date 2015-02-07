// This is where any explicit script odering should
// be declared.
module.exports = {
  app: [
    './src/js/app.js',
    './src/js/**/!(init.js)',
    './src/js/init.js'
  ],

  vendor: [
    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/lodash/lodash.min.js'
  ]
};
