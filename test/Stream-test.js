/* global describe, it */
require('buster').spec.expose()
var expect = require('buster').expect

var Stream = require('../src/Stream').default

var sentinel = { value: 'sentinel' }

describe('Stream', function () {
  it('should have expected source', function () {
    var s = new Stream(sentinel)
    expect(s.source).toBe(sentinel)
  })
})
