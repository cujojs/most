var unhandledRejection = require('when/lib/decorators/unhandledRejection');
var PromiseImpl = unhandledRejection(require('when/lib/Promise'));

exports.Promise = PromiseImpl;
exports.defer = defer;
exports.delay = delay;
exports.when = when;
exports.raceIndex = raceIndex;
exports.never = PromiseImpl.never;
exports.getStatus = PromiseImpl._handler;

/**
 * Create a { promise, resolve, reject } tuple
 * @returns {{promise:Promise, resolve:function(*), reject:function(*)}} tuple
 */
function defer() {
	var d = { promise: void 0, resolve: void 0, reject: void 0 };
	d.promise = new PromiseImpl(function(resolve, reject) {
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
	return new PromiseImpl(function(resolve) {
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
		&& (typeof x === 'object' || typeof x === 'function')
		&& typeof x.then === 'function';
}

/**
 * Like Promise.race, but calls f with the value *and index* of the first
 * fulfilled promise, and returns a promise for the result.
 * @param {function(x:*, i:Number):*} f function to apply to first
 *  fulfilled value and its index
 * @param {Array} promises
 * @returns {Promise}
 */
function raceIndex(f, promises) {
	var done = false;
	return new PromiseImpl(runRaceIndex);

	function runRaceIndex(resolve, reject) {
		for(var i= 0, l=promises.length; i<l; ++i) {
			settleOne(resolve, reject, i, promises[i]);
		}
	}

	function settleOne(resolve, reject, i, p) {
		PromiseImpl.resolve(p).then(function(x) {
			if(!done) {
				done = true;
				resolve(f(x, i));
			}
		}, reject);
	}
}
