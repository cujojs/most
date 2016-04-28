var most = require(__dirname);
var path = require('path');
var fs = require('fs');

// because npm 3 flattens modules
if (fs.existsSync(path.join(__dirname, '/node_modules/babel'))) {
  var babelPath = '/node_modules/babel';
} else {
  var babelPath = '/node_modules/markdown-doctest/node_modules/babel';
}

// needed for regeneratorRuntime
require(path.join(__dirname, babelPath, 'polyfill'));

function noop () {};

module.exports = {
  require: {
    most: most,
   'transducers-js': require('transducers-js')
  },

  globals: {
    most: most,

    regeneratorRuntime: regeneratorRuntime,

    document: {
      addEventListener: noop,
      removeEventListener: noop,

      querySelector: function () {
        return {
          addEventListener: noop,
          removeEventListener: noop
        }
      }
    },

    exports: {},

    doSomething: noop,
    parseForm: noop,
    postToServer: noop,
    processData: noop,

    stream: most.empty(),
    mousemovesAfterFirstClick: most.empty()
  },

  babel: {
    stage: 0
  }
}
