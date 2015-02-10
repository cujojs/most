/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

module.exports = Disposable;

function Disposable(f, data) {
	this.disposed = false;
	this._dispose = f;
	this._data = data;
}

Disposable.prototype.dispose = function() {
	if(this.disposed) {
		return;
	}
	this.disposed = true;
	return this._dispose(this._data);
};
