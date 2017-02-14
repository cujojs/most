/* global describe, it */
require('buster').spec.expose()
var assert = require('buster').referee.assert

var reduce = require('../../src/combinator/accumulate').reduce
var map = require('../../src/combinator/transform').map
var fo = require('../../src/observable/fromObservable')
var subscribe = require('../../src/observable/subscribe').subscribe
var fromObservable = fo.fromObservable
var ObservableSource = fo.ObservableSource
var SubscriberSink = fo.SubscriberSink

function simpleObservable (subscribe) {
  return { subscribe: subscribe }
}

describe('fromObservable', function () {
  it('should contain observable items', function () {
    var events = [1, 2, 3]
    var o = simpleObservable(function (observer) {
      events.forEach(function (x) {
        observer.next(x)
      })
      observer.complete()
      return function () {}
    })

    var s = fromObservable(o)
    return reduce(function (a, x) { return a.concat(x) }, [], s)
      .then(function (a) {
        assert.equals(events, a)
      })
  })

  it('should handle thrown errors', function (done) {
    var o = simpleObservable(function (observer) {
      observer.next(1)

      return function () {}
    })

    function boom () {
      throw new Error('boom!')
    }

    assert.equals(true, true) // buster requires an assertion

    var s = map(boom, fromObservable(o))

    subscribe({
      next () { done(new Error('next should not be called')) },

      error () { done() },

      complete () { done(new Error('complete should not be called')) }
    }, s)
  })
})

describe('ObservableSource', function () {
  it('when subscribe returns function, should return disposable', function () {
    var sentinel = {}
    var o = simpleObservable(function () {
      return function () { return sentinel }
    })

    var os = new ObservableSource(o)
    var disposable = os.run({}, {})

    assert.same(sentinel, disposable.dispose())
  })

  it('when subscribe returns object, should return disposable', function () {
    var sentinel = {}
    var o = simpleObservable(function () {
      return { unsubscribe: function () { return sentinel } }
    })

    var os = new ObservableSource(o)
    var disposable = os.run({}, {})

    assert.same(sentinel, disposable.dispose())
  })

  it('when subscribe returns neither function nor object, should throw TypeError', function () {
    var o = simpleObservable(function () {
      return null
    })

    var os = new ObservableSource(o)
    assert.exception(function () {
      os.run({}, {})
    })
  })
})

describe('SubscriberSink', function () {
  describe('next', function () {
    it('should call sink.event', function () {
      var sink = { event: this.spy() }
      var scheduler = { now: function () { return 1 } }
      var ss = new SubscriberSink(sink, scheduler)

      var x = {}
      ss.next(x)

      assert.calledOnceWith(sink.event, 1, x)
    })
  })

  describe('complete', function () {
    it('should call sink.end', function () {
      var sink = { end: this.spy() }
      var scheduler = { now: function () { return 1 } }
      var ss = new SubscriberSink(sink, scheduler)

      var x = {}
      ss.complete(x)

      assert.calledOnceWith(sink.end, 1, x)
    })
  })

  describe('error', function () {
    it('should call sink.error', function () {
      var sink = { error: this.spy() }
      var scheduler = { now: function () { return 1 } }
      var ss = new SubscriberSink(sink, scheduler)

      var x = {}
      ss.error(x)

      assert.calledOnceWith(sink.error, 1, x)
    })
  })
})
