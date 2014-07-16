/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Promise = require('./Promise');

module.exports = defer;

/**
 * Create a { promise, resolve, reject } tuple
 * @returns {{promise:Promise, resolve:function(*), reject:function(*)}} tuple
 */
function defer() {
	var d = { promise: void 0, resolve: void 0, reject: void 0 };
	d.promise = new Promise(function(resolve, reject) {
		d.resolve = resolve;
		d.reject = reject;
	});
	return d;
}
