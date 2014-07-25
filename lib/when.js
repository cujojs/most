module.exports = when;

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