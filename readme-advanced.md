# Gulp Starter Kit

A basic Gulp setup for generating a static site.

Running "gulp" will compile the site found in "src" and deploy it to a folder called "dist". Support is built in for SCSS.

Running "gulp release" will minify JavaScript, CSS, and HTML, and bust caches.

gulp test will continuously run all qunit tests in the /test directory

gulp deploy will build a release build and push it to the gh-pages branch

## Getting Started

To get started, clone this repo, and modify/delete/add sources in the src folder to suit your needs.

Run "gulp" to launch the site in debug mode.

## Scripts

Out of the box, any scripts in /src/js/vendor will be bundled into /dest/js/vendor.js

Vendor is a special name, and will not minify; only concat.

All other scripts will be bundled into /dest/js/app.js

If you need a new bundle, or want to get rid of/change app.js, edit /gulp/script-definitions.js and add a new bundle.

    // This is where any explicit script odering should
    // be declared.
    module.exports = {
      app: ['!./src/js/vendor/**/*', './src/js/**/*'],
      vendor: ['./src/js/vendor/**/*'],
      mynewbundle: ['./src/someotherplace/*.js']
    };

If you need to modify the ordering of scripts in existing bundles, edit their definition in /gulp/script-definitions.js

## EJS Templates

EJS templates are supported at build time. Partials should start with an _, so
the build system doesn't copy them to the destination folder.

EJS files should end with .ejs. There is a global "scope" property which you
can use to send values to partials.

For example, given the file /src/index.ejs:

    <% scope.user = { name: 'Chris' } %>
    <% include partials/_sayhi %>

The partial /src/partials/_sayhi.ejs might look like this:

    <p>Hello, <%= scope.user.name %></p>

That's about it!

## Minification Bug

When JavaScript is uglified, source maps stop working. Alas, you can't have
everything...

## TODO

Don't build everything when a file changes... See if a more optimal watch/bulid
cycle can be devised.
