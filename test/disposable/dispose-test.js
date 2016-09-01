/* global describe, it */
require('buster').spec.expose()
var expect = require('buster').expect

var dispose = require('../../src/disposable/dispose')

function noop () {}

function throws (e) {
  throw e
}

function rejects (e) {
  return Promise.reject(e)
}

function returns (x) {
  return x
}

function disposableSpy (f, x) {
  return {
    called: 0,
    dispose: function () {
      this.called++
      return f(x)
    }
  }
}

function called (n) {
  return function (d) {
    return d.called === n
  }
}

var calledOnce = called(1)

var failSink = {
  error: function (t, e) {
    throw e
  }
}

function catchSink () {
  return {
    time: NaN,
    value: {},
    error: function (t, e) {
      this.time = t
      this.value = e
    }
  }
}

describe('tryDispose', function () {
  it('should return disposable result', function () {
    var x = {}
    var spy = disposableSpy(returns, x)

    var result = dispose.tryDispose(0, spy, failSink)
    expect(result).toBe(x)
  })

  it('should return disposable result promise', function () {
    var x = {}
    var spy = disposableSpy(returns, Promise.resolve(x))

    return dispose.tryDispose(0, spy, failSink).then(function (y) {
      expect(y).toBe(x)
    })
  })

  it('should propagate error if disposable throws', function () {
    var x = {}
    var spy = disposableSpy(throws, x)

    var sink = catchSink()
    var t = Math.random()
    return dispose.tryDispose(t, spy, sink).then(function () {
      expect(sink.time).toBe(t)
      expect(sink.value).toBe(x)
    })
  })

  it('should propagate error if disposable rejects', function () {
    var x = {}
    var spy = disposableSpy(returns, Promise.reject(x))

    var sink = catchSink()
    var t = Math.random()
    return dispose.tryDispose(t, spy, sink).then(function () {
      expect(sink.time).toBe(t)
      expect(sink.value).toBe(x)
    })
  })
})

describe('dispose.all', function () {
  it('should dispose all', function () {
    var disposables = [
      disposableSpy(noop),
      disposableSpy(returns, 123),
      disposableSpy(returns, Promise.resolve())
    ]

    return dispose.all(disposables).dispose().then(function (results) {
      expect(results).toBeArray()
      expect(disposables.every(calledOnce)).toBeTrue()
    })
  })

  it('should dispose all nested', function () {
    var nested = [
      disposableSpy(noop),
      disposableSpy(returns, 123),
      disposableSpy(returns, Promise.resolve())
    ]
    var disposables = [
      disposableSpy(noop),
      dispose.all(nested),
      disposableSpy(noop)
    ]

    return dispose.all(disposables).dispose().then(function (results) {
      expect(results).toBeArray()
      expect(nested.every(calledOnce)).toBeTrue()
    })
  })

  it('should dispose all regardless of errors', function () {
    var disposables = [
      disposableSpy(noop),
      disposableSpy(throws, new Error()),
      disposableSpy(rejects, new Error()),
      disposableSpy(noop)
    ]

    return dispose.all(disposables).dispose().then(
      function () {
        throw new Error('should not have disposed successfully')
      },
      function () {
        expect(disposables.every(calledOnce)).toBeTrue()
      })
  })

  it('should dispose nested regardless of errors', function () {
    var nested = [
      disposableSpy(noop),
      disposableSpy(throws, new Error()),
      disposableSpy(rejects, new Error()),
      disposableSpy(noop)
    ]

    var disposables = [
      disposableSpy(throws, new Error()),
      dispose.all(nested),
      disposableSpy(rejects, new Error())
    ]

    return dispose.all(disposables).dispose().then(
      function () {
        throw new Error('should not have disposed successfully')
      },
      function () {
        expect(nested.every(calledOnce)).toBeTrue()
      })
  })
})

describe('dispose.once', function () {
  it('should call underlying dispose', function () {
    var x = {}
    var spy = disposableSpy(returns, x)
    var d = dispose.once(spy)

    var result = d.dispose()

    expect(result).toBe(x)
    expect(calledOnce(spy)).toBeTrue()
  })

  it('should call underlying dispose at most once', function () {
    var x = {}
    var spy = disposableSpy(returns, x)
    var d = dispose.once(spy)

    expect(d.dispose()).toBe(d.dispose())
    expect(calledOnce(spy)).toBeTrue()
  })
})

describe('dispose.create', function () {
  it('should call dispose function with data', function () {
    var x = {}
    var y
    var d = dispose.create(function (x) {
      y = x
      return x
    }, x)

    var result = d.dispose()

    expect(result).toBe(x)
    expect(y).toBe(x)
  })

  it('should call dispose function at most once', function () {
    var x = 0
    var d = dispose.create(function () {
      return x++
    })

    d.dispose()
    d.dispose()

    expect(x).toBe(1)
  })
})

describe('dispose.empty', function () {
  it('should return undefined', function () {
    expect(dispose.empty().dispose()).toBe(void 0)
  })
})

describe('dispose.promised', function () {
  it('should dispose promised disposable', function () {
    var x = {}
    var spy = disposableSpy(returns, x)
    var d = dispose.promised(Promise.resolve(spy))

    return d.dispose().then(function (y) {
      expect(y).toBe(x)
      expect(calledOnce(spy)).toBeTrue()
    })
  })

  it('should return rejected promise if disposable rejects', function () {
    var x = {}
    var spy = disposableSpy(returns, Promise.reject(x))
    var d = dispose.promised(Promise.resolve(spy))

    return d.dispose().then(function () {
      throw new Error('should not fulfill')
    }, function (e) {
      expect(e).toBe(x)
      expect(calledOnce(spy)).toBeTrue()
    })
  })

  it('should return rejected promise if disposable throws', function () {
    var x = {}
    var spy = disposableSpy(throws, x)
    var d = dispose.promised(Promise.resolve(spy))

    return d.dispose().then(function () {
      throw new Error('should not fulfill')
    }, function (e) {
      expect(e).toBe(x)
      expect(calledOnce(spy)).toBeTrue()
    })
  })

  it('should not dispose promised disposable if rejected', function () {
    var x = {}
    var d = dispose.promised(Promise.reject(x))

    return d.dispose().then(function () {
      throw new Error('should not fulfill')
    }, function (e) {
      expect(e).toBe(x)
    })
  })
})
