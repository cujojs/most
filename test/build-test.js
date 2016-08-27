/* global describe, it */
require('buster').spec.expose()
var expect = require('buster').expect

var build = require('../src/combinator/build')
var observe = require('../src/combinator/observe').observe
var delay = require('../src/combinator/delay').delay
var reduce = require('../src/combinator/accumulate').reduce
var fromArray = require('../src/source/fromArray').fromArray
var core = require('../src/source/core')

var streamOf = core.of
var empty = core.empty

var te = require('./helper/testEnv')

var sentinel = { value: 'sentinel' }

describe('build', function () {
  describe('startWith', function () {
    it('should return a stream containing item as head', function () {
      var s = build.cons(sentinel, empty())
      return observe(function (x) {
        expect(x).toBe(sentinel)
      }, s)
    })
  })

  describe('concat', function () {
    it('should return a stream containing items from both streams in correct order', function () {
      var dt = 1
      var s1 = delay(dt, fromArray([1, 2]))
      var s2 = fromArray([3, 4])

      return te.collectEvents(build.concat(s1, s2), te.ticks(dt + 2))
        .then(function (events) {
          var values = events.map(function (event) {
            return event.value
          })
          expect(values).toEqual([1, 2, 3, 4])
        })
    })

    it('should satisfy left identity', function () {
      var s = build.concat(streamOf(sentinel), empty())

      return reduce(function (count, x) {
        expect(x).toBe(sentinel)
        return count + 1
      }, 0, s).then(function (count) {
        expect(count).toBe(1)
      })
    })

    it('should satisfy right identity', function () {
      var s = build.concat(empty(), streamOf(sentinel))

      return reduce(function (count, x) {
        expect(x).toBe(sentinel)
        return count + 1
      }, 0, s).then(function (count) {
        expect(count).toBe(1)
      })
    })
  })
})
