/* global describe, it */
require('buster').spec.expose()
var expect = require('buster').expect

var Stream = require('../../src/Stream').default
var loop = require('../../src/combinator/loop').loop
var reduce = require('../../src/combinator/accumulate').reduce
var drain = require('../../src/combinator/observe').drain
var fromArray = require('../../src/source/fromArray').fromArray
var throwError = require('../../src/combinator/errors').throwError
var core = require('../../src/source/core')
var streamOf = core.of

var FakeDisposeSource = require('../helper/FakeDisposeSource')

var sentinel = { value: 'sentinel' }
var other = { value: 'other' }

function toPair (z, x) {
  return { value: x, seed: z }
}

describe('loop', function () {
  it('should call stepper with seed, value', function () {
    var a = ['a', 'b', 'c', 'd']

    var s = loop(function (z, x) {
      return { value: x + z, seed: z + 1 }
    }, 0, fromArray(a))

    return reduce(function (r, x) {
      return r.concat(x)
    }, [], s).then(function (result) {
      expect(result).toEqual(['a0', 'b1', 'c2', 'd3'])
    })
  })

  it('should propagate errors', function () {
    var s = loop(toPair, other, throwError(sentinel))

    return drain(s).catch(function (e) {
      expect(e).toBe(sentinel)
    })
  })

  it('should dispose', function () {
    var dispose = this.spy()

    var stream = new Stream(new FakeDisposeSource(dispose, streamOf(sentinel).source))
    var s = loop(toPair, 0, stream)

    return drain(s).then(function () {
      expect(dispose).toHaveBeenCalledOnce()
    })
  })
})
