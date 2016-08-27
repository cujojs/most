/* global describe, it */
require('buster').spec.expose()
var expect = require('buster').expect

var SettableDisposable = require('../../src/disposable/SettableDisposable').default

describe('SettableDisposable', function () {
  it('should allow setDisposable before dispose', function () {
    var d = new SettableDisposable()
    var data = {}

    d.setDisposable({
      dispose: function () { return data }
    })

    var x = d.dispose()

    expect(x).toBe(data)
  })

  it('should allow setDisposable after dispose', function () {
    var d = new SettableDisposable()
    var data = {}

    var p = d.dispose()

    d.setDisposable({
      dispose: function () { return data }
    })

    return p.then(function (x) {
      expect(x).toBe(data)
    })
  })

  it('should allow setDisposable at most once', function () {
    var d = new SettableDisposable()

    d.setDisposable({})

    expect(function () {
      d.setDisposable({})
    }).toThrow()
  })
})
