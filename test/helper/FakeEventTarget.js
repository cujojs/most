module.exports = FakeEventTarget;

function FakeEventTarget() {
	this._handler = this._event = void 0;
}

FakeEventTarget.prototype.emit = function(x) {
	if(typeof this._handler !== 'function') {
		return;
	}
	this._handler.call(void 0, x);
};

FakeEventTarget.prototype.addEventListener = function(e, handler) {
	this._event = e;
	this._handler = handler;
};

FakeEventTarget.prototype.removeEventListener = function(e, handler) {
	if(e !== this._event || handler !== this._handler) {
		throw new Error('removed wrong handler');
	}
	this._handler = this._event = void 0;
};
