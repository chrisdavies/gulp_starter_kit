# Gulp Starter Kit

A basic Gulp setup for generating a static site.

Running "gulp" will compile the site found in "src" and deploy it to a folder called "dist". Support is built in for SCSS.

Running "gulp release" will minify JavaScript, CSS, and HTML, and bust caches.

## Getting Started

To get started, clone this repo, and modify/delete/add sources in the src folder to suit your needs.

Run "gulp" to launch the site in debug mode.

## Scripts

Out of the box, any scripts in /src/js/vendor will be bundled into /dest/js/vendor.js

And all other scripts will be bundled into /dest/js/app.js

If you need a new bundle, edit /gulp/script-definitions.js and add a new bundle.

    // This is where any explicit script odering should
    // be declared.
    module.exports = {
      app: ['!./src/js/vendor/**/*', './src/js/**/*'],
      vendor: ['./src/js/vendor/**/*'],
      mynewbundle: ['./src/someotherplace/*.js']
    };

If you need to modify the ordering of scripts in existing bundles, edit their definition in /gulp/script-definitions.js

## Minification Bug

When JavaScript is uglified, source maps stop working.

## TODO

* Add support for build-time templates
