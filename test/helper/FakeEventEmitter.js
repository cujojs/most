module.exports = FakeEventEmitter

function FakeEventEmitter () {
  this._handler = this._event = void 0
}

FakeEventEmitter.prototype.emit = function () {
  if (typeof this._handler !== 'function') {
    return
  }
  this._handler.apply(void 0, arguments)
}

FakeEventEmitter.prototype.addListener = function (e, handler) {
  this._event = e
  this._handler = handler
}

FakeEventEmitter.prototype.removeListener = function (e, handler) {
  if (e !== this._event || handler !== this._handler) {
    throw new Error('removed wrong handler')
  }
  this._handler = this._event = void 0
}
