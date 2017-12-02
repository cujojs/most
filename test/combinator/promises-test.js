/* global describe, it */
require('buster').spec.expose()
var expect = require('buster').expect

var promises = require('../../src/combinator/promises')
var observe = require('../../src/combinator/observe').observe
var reduce = require('../../src/combinator/accumulate').reduce
var streamOf = require('../../src/source/core').of
var fromArray = require('../../src/source/fromArray').fromArray

var sentinel = { value: 'sentinel' }

describe('await', function () {
  it('should await promises', function () {
    var s = promises.awaitPromises(streamOf(Promise.resolve(sentinel)))

    return observe(function (x) {
      expect(x).toBe(sentinel)
    }, s)
  })

  it('should preserve event order', function () {
    var slow = new Promise(function (resolve) {
      setTimeout(resolve, 10, 1)
    })
    var fast = Promise.resolve(sentinel)

    // delayed promise followed by already fulfilled promise
    var s = promises.awaitPromises(fromArray([slow, fast]))

    return reduce(function (a, x) {
      return a.concat(x)
    }, [], s).then(function (a) {
      expect(a).toEqual([1, sentinel])
    })
  })

  it('should propagate error if promise rejects', function () {
    var s = promises.awaitPromises(fromArray([Promise.resolve(), Promise.reject(sentinel), Promise.resolve()]))
    var spy = this.spy()
    return observe(spy, s).catch(function (e) {
      expect(e).toBe(sentinel)
      expect(spy).toHaveBeenCalledOnce()
    })
  })
})

describe('fromPromise', function () {
  it('should contain only promise\'s fulfillment value', function () {
    return observe(function (x) {
      expect(x).toBe(sentinel)
    }, promises.fromPromise(Promise.resolve(sentinel)))
  })

  it('should propagate error if promise rejects', function () {
    var spy = this.spy()
    return observe(spy, promises.fromPromise(Promise.reject(sentinel)))
      .catch(function (e) {
        expect(e).toBe(sentinel)
        expect(spy).not.toHaveBeenCalled()
      })
  })

  it('should be recoverable if promise rejects', function () {
    var s = promises.fromPromise(Promise.reject(new Error()))
      .recoverWith(function () {
        return promises.fromPromise(Promise.resolve(sentinel))
      })

    return observe(function (x) {
      expect(x).toBe(sentinel)
    }, s)
  })
})
