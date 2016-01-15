module.exports = FakeEventTarget;

function FakeEventTarget() {
	this._handler = this._event = this._capture = void 0;
}

FakeEventTarget.prototype.emit = function(x) {
	if(typeof this._handler !== 'function') {
		return;
	}
	this._handler.call(void 0, x);
};

FakeEventTarget.prototype.addEventListener = function(e, handler, capture) {
	this._event = e;
	this._handler = handler;
	this._capture = capture;
};

FakeEventTarget.prototype.removeEventListener = function(e, handler, capture) {
	if(e !== this._event || handler !== this._handler || this._capture !== capture) {
		throw new Error('unexpected args passed to removeEventListener');
	}
	this._handler = this._event = void 0;
};
