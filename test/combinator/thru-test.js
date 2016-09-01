/* global describe, it */
require('buster').spec.expose()
var expect = require('buster').expect

var thru = require('../../src/combinator/thru').thru

describe('thru', function () {
  it('should apply f to stream', function () {
    var stream = {}
    var expected = {}
    function f (s) {
      return expected
    }

    expect(thru(f, stream)).toBe(expected)
  })

  it('should throw synchronously if f throws synchronously', function () {
    var error = new Error()
    function f () {
      throw error
    }

    try {
      thru(f, {})
    } catch (e) {
      expect(e).toBe(error)
    }
  })
})
