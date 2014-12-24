# Gulp Starter Kit

A basic Gulp setup for generating a static site.

Running "gulp" will compile the site found in "src" and deploy it to a folder called "dest". Support is built in for handlebars templates and sccs.

JavaScript, CSS, and HTML are all minified.

Src/hrefs are all cache-busted.

The one catch is that JavaScript minification does not mangle variable names, due to a bug with uglifier's source maps.

To build a "release" build with mangled variable names, run "grunt release".
