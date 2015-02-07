## What is Gulp?

Gulp is a build system. That is, it is a tool that is used to take a bunch of resources (such as HTML, JavaScript, CSS files, etc), perform some processing on them, and get them prepped for production.

## What does this project do?

Lots. But for now, we'll use it to compile any content it finds in the src directory, move it to the dest directory, and serve it from there.

Primarily, right now, you'll be using this so you can get access to SCSS.

## How do you use it?

### First, make an empty clone of this repo:

1. Pull it down (run this in Terminal):

    git clone git@github.com:tiy-durham-fe-2015/gulp-lite.git

2. Rename the gulp-lite directory to whatever your project name will be

    mv gulp-lite my-project-name

3. cd into the new directory

    cd my-project-name
    rm -rf .git
    git init
    git add .
    git commit -m "Initial checkin"

### Next install dependencies

Next, you'll need to make sure that gulp and all it's dependencies are installed. From the terminal:

    npm install

Note, if this errors, you may need to install Node. You can do that here: http://nodejs.org/download/


### Finally, run gulp

It's pretty simple. In the Terminal, in your project directory, run:

    gulp

If all works as expected, you should see something like this in your terminal:

    [20:16:52] Using gulpfile ~/src/my-proj/gulpfile.js
    [20:16:52] Starting 'watch'...
    [20:16:52] Finished 'watch' after 6.62 ms
    [20:16:52] Starting 'default'...
    [20:16:52] Finished 'default' after 14 ms
    [20:16:52] Server started http://localhost:8000
    [20:16:52] LiveReload started on port 35729

So, you should be able to go here in Chrome:

http://localhost:8000

Now, when you edit and save index.html, or the css files, etc, chrome should automatically refresh. Purty cewl.
