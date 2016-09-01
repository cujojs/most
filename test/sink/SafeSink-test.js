/* global describe, it */
require('buster').spec.expose()
var expect = require('buster').expect

var SafeSink = require('../../src/sink/SafeSink').default

function testSink (event, end, error) {
  return {
    event: event,
    end: end,
    error: error
  }
}

function testEvent (event) {
  return testSink(event, fail, fail)
}

function testEnd (end) {
  return testSink(fail, end, fail)
}

function testError (error) {
  return testSink(fail, fail, error)
}

function fail () {
  throw new Error('Should not be called')
}

function noop () {}

describe('SafeSink', function () {
  it('should propagate event while active', function () {
    var time = 123
    var expected = {}
    var sink = new SafeSink(testEvent(function (t, x) {
      expect(t).toBe(time)
      expect(x).toBe(expected)
    }))

    sink.event(time, expected)
  })

  it('should propagate end while active', function () {
    var time = 123
    var expected = {}
    var sink = new SafeSink(testEnd(function (t, x) {
      expect(t).toBe(time)
      expect(x).toBe(expected)
    }))

    sink.end(time, expected)
  })

  it('should propagate error while active', function () {
    var time = 123
    var expected = new Error()
    var sink = new SafeSink(testError(function (t, x) {
      expect(t).toBe(time)
      expect(x).toBe(expected)
    }))

    sink.error(time, expected)
  })

  it('should not propagate event or end after end', function () {
    var time = 123
    var expected = {}
    var sink = new SafeSink(testEnd(function (t, x) {
      expect(t).toBe(time)
      expect(x).toBe(expected)
    }))

    sink.end(time, expected)
    sink.end(time + 1, expected)
    sink.event(time + 2, expected)
  })

  it('should not propagate event or end after error', function () {
    var time = 123
    var expected = new Error()
    var sink = new SafeSink(testError(function (t, x) {
      expect(t).toBe(time)
      expect(x).toBe(expected)
    }))

    sink.error(time, expected)
    sink.end(time + 1, expected)
    sink.event(time + 2, expected)
  })

  it('should not propagate event or end after disabled', function () {
    // Test will fail if any event, error, or end are
    // propagated.  Buster requires at least one expectation
    // per test, hence the expect(true) below
    var sink = new SafeSink(testSink(fail, fail, fail))

    sink.disable()
    sink.end(1, {})
    sink.event(2, {})
    expect(true).toBe(true)
  })

  it('should propagate error after disable', function () {
    var errorCalled = 0
    var sink = new SafeSink(testError(function () {
      errorCalled += 1
    }))

    sink.disable()
    sink.error(1, new Error())
    expect(errorCalled).toBe(1)
  })

  it('should propagate error after end', function () {
    var errorCalled = 0
    var sink = new SafeSink(testSink(fail, noop, function () {
      errorCalled += 1
    }))

    sink.end(0, {})
    sink.error(1, new Error())
    expect(errorCalled).toBe(1)
  })

  it('should propagate error after error', function () {
    var errorCalled = 0
    var sink = new SafeSink(testSink(fail, noop, function () {
      errorCalled += 1
    }))

    sink.error(0, new Error())
    sink.error(1, new Error())
    expect(errorCalled).toBe(2)
  })

  it('disable should return original sink', function () {
    var original = testSink(fail, fail, fail)
    var sink = new SafeSink(original)

    expect(sink.disable()).toBe(original)
  })
})
