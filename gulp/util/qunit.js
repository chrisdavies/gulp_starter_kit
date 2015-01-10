// qunit module uses zombiejs to run qunit tests
// and outputs results to the console.

// Zombie is the browser class
var Zombie = require('zombie'),

  // path is a file system helper
  path = require('path'),

  // colors allow us to write colored text to the console
  colors = require('colors/safe');

module.exports = runAllQunitTests;

// runAllQunitTests runs all of the tests and then
// calls the done callback when tests have completed
function runAllQunitTests(testFiles, done) {
  // Initialize the browser for testing
  browser = browser || new Zombie();

  function queueTest() {
    setTimeout(function () {
      runQunitTest(testFiles.pop(), next);
    });
  }

  function next() {
    if (testFiles.length) {
      queueTest();
    } else {
      done();
    }
  }

  next();
}

// The global zombiejs instance. This is global so
// that cleanup doesn't take a ton of time when
// watching /test for changes
var browser = undefined;

// Prints errors to the console
function printError(errorNode, selector) {
  console.log(colors.yellow((errorNode.querySelector(selector) || {}).textContent));
}

// Prints all unit test errors to the console
function printErrors() {
  var errors = browser.document.querySelectorAll('#qunit-tests > .fail');
  Array.prototype.slice.call(errors, 0).forEach(function (error) {
    printError(error, '.test-name');
    printError(error, '.test-message');
    printError(error, '.test-source');
  });
}

// Prints qunit results to the console
function printQunitResults() {
  var passed = browser.document.querySelector('#qunit-testresult .failed').textContent.trim() === '0',
    color = passed ? 'green' : 'red',
    text = browser.document.querySelector('#qunit-testresult').textContent;

  !passed && printErrors();

  console.log(colors[color](text));
  return text;
}

// runQunitTest runs the specified qunit test
function runQunitTest(file, next) {
  console.log(file);
  var url = 'file:/' + path.resolve(file);

  console.log('Running ' + file);

  browser.visit(url)
    .then(printQunitResults)
    .catch(function (ex) {
      console.log(colors.red(ex));
    }).finally(next);
}
