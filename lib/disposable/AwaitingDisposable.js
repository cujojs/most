/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

module.exports = AwaitingDisposable;

function AwaitingDisposable(p) {
	this.promise = p;
}

AwaitingDisposable.prototype.dispose = function() {
	return this.promise;
};
