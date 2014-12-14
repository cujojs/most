/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var all = require('../Promise').all;
var map = require('../base').map;

module.exports = CompoundDisposable;

function CompoundDisposable(disposables) {
	this.disposables = disposables;
}

CompoundDisposable.prototype.dispose = function() {
	return all(map(dispose, this.disposables));
};

function dispose(disposable) {
	return disposable.dispose();
}