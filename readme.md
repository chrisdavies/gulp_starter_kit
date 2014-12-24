# Gulp Starter Kit

A basic Gulp setup for generating a static site.

Running "gulp" will compile the site found in "src" and deploy it to a folder called "dest". Support is built in for handlebars templates and sccs.

JavaScript, CSS, and HTML are all minified.

Src/hrefs are all cache-busted.

## Minification Bug

The one catch is that JavaScript minification does not mangle variable names, due to a bug with uglifier's source maps. When uglifier mangles names, the source maps do not recognize the original names. (e.g. evaluating original variable names in the console always results in undefined).

So, to facilitate debugging, this build process doesn't mangle names.

To build a "release" build with mangled variable names, run "gulp build --release".
