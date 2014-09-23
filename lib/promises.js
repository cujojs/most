var WhenPromise = require('when/es6-shim/Promise');

exports.Promise = WhenPromise;
exports.defer = defer;
exports.delay = delay;
exports.when = when;
exports.never = never;
exports.getStatus = WhenPromise._handler;

var neverP = { then: never, catch: never };

/**
 * @returns {Promise} a promise that never resolves.  Returns a singleton
 * that consumes no additional resources even when adding handlers with
 * then() and catch().
 */
function never() {
	return neverP;
}

/**
 * Create a { promise, resolve, reject } tuple
 * @returns {{promise:Promise, resolve:function(*), reject:function(*)}} tuple
 */
function defer() {
	var d = { promise: void 0, resolve: void 0, reject: void 0 };
	d.promise = new WhenPromise(function(resolve, reject) {
		d.resolve = resolve;
		d.reject = reject;
	});
	return d;
}

/**
 * Return a promise that will be resolved with x after delayTime on the
 * provided scheduler.
 * @param {Number} delayTime delay after which the promise will be resolved with x
 * @param {*} x resolution
 * @param {Scheduler} scheduler scheduler on which to schedule the delay
 * @returns {Promise} promise that will be resolved after delayTime
 */
function delay(delayTime, x, scheduler) {
	return new Promise(function(resolve) {
		scheduler.delayed(delayTime, resolve, x);
	});
}

/**
 * (WARNING: allows sync or async application of f. Internal use only)
 * Apply f to the value of x. If x is promise, applies f when x is fulfilled.
 * Otherwise, applies f synchronously
 * @param {function} f
 * @param {*|Promise} x
 * @returns {*|Promise}
 */
function when (f, x) {
	return isPromise(x) ? x.then(f) : f(x);
}

function isPromise(x) {
	return x !== null
		&& (typeof x === 'object' || typeof x === 'function' )
		&& typeof x.then === 'function';
}

