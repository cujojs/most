/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var traverse = require('../Promise')._traverse;

module.exports = CompoundDisposable;

function CompoundDisposable(disposables) {
	this.disposables = disposables;
}

CompoundDisposable.prototype.dispose = function() {
	return traverse(dispose, this.disposables);
};

function dispose(disposable) {
	return disposable.dispose();
}