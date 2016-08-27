/* global describe, it */
require('buster').spec.expose()
var expect = require('buster').expect

var timestamp = require('../../src/combinator/timestamp').timestamp
var periodic = require('../../src/source/periodic').periodic
var take = require('../../src/combinator/slice').take

var te = require('../helper/testEnv')

var sentinel = 'sentinel'

describe('timestamp', function () {
  it('should emit time-value pairs', function () {
    var n = 10
    var s = take(n, timestamp(periodic(1, sentinel)))

    return te.collectEvents(s, te.ticks(n)).then(function (events) {
      events.forEach(function ({ value: { time, value } }, i) {
        expect(value).toEqual(sentinel)
        expect(time).toEqual(i)
      })
    }, s)
  })
})
