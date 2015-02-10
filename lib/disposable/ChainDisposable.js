/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var resolve = require('../Promise').resolve;

module.exports = ChainDisposable;

function ChainDisposable(first, second) {
	this.disposed = false;
	this.first = first;
	this.second = second;
}

ChainDisposable.prototype.dispose = function() {
	if(this.disposed) {
		return;
	}
	this.disposed = true;

	var disposable = this.second;
	return resolve(this.first.dispose())
		.then(function() {
			return disposable.dispose();
		});
};