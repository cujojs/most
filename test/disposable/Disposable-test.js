/* global describe, it */
require('buster').spec.expose()
var expect = require('buster').expect

var Disposable = require('../../src/disposable/Disposable').default

describe('Disposable', function () {
  it('should call disposer with data', function () {
    var spy = this.spy(function (x) {
      return x
    })
    var data = {}

    var d = new Disposable(spy, data)

    expect(d.dispose()).toBe(data)
    expect(spy).toHaveBeenCalledOnceWith(data)
  })
})
