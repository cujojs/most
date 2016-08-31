require('buba/register')
var most = require('./src/index')

// needed for regeneratorRuntime
require('babel-polyfill');

function noop () {};

module.exports = {
  require: {
    most: most,
    '@most/hold': require('@most/hold'),
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
  }
}
