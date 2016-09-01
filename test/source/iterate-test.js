/* global describe, it */
require('buster').spec.expose()
var expect = require('buster').expect

var iterate = require('../../src/source/iterate')
var take = require('../../src/combinator/slice').take
var observe = require('../../src/combinator/observe').observe

var sentinel = { value: 'sentinel' }
var other = { value: 'other' }

describe('iterate', function () {
  it('should yield initial value', function () {
    var iterator = this.spy()
    var s = take(1, iterate.iterate(iterator, sentinel))

    return observe(function (x) {
      expect(x).toBe(sentinel)
      expect(iterator).not.toHaveBeenCalled()
    }, s)
  })

  it('should call iterator with initial value', function () {
    var iterator = this.spy(function (x) {
      return x + 1
    })
    var s = take(2, iterate.iterate(iterator, 0))

    var count = 0
    return observe(function (x) {
      expect(x).toBe(count)
      count++
    }, s).then(function () {
      expect(iterator).toHaveBeenCalledOnceWith(0)
    })
  })

  it('should call iterator repeatedly', function () {
    var s = take(10, iterate.iterate(function (x) {
      return x + 1
    }, 0))

    var count = 0
    return observe(function (x) {
      expect(x).toBe(count)
      count++
    }, s)
  })

  it('should allow future events by returning a promise', function () {
    var s = take(10, iterate.iterate(function (x) {
      return Promise.resolve(x + 1)
    }, 0))

    var count = 0
    return observe(function (x) {
      expect(x).toBe(count)
      count++
    }, s)
  })

  it('should reject on error', function () {
    var spy = this.spy()
    var s = iterate.iterate(function () {
      throw sentinel
    }, other)

    return observe(spy, s).catch(function (e) {
      expect(spy).toHaveBeenCalledOnceWith(other)
      expect(e).toBe(sentinel)
    })
  })
})
