module.exports = curry;

var slice = Array.prototype.slice;

/**
 * Curry an N-argument function to a series of 1-argument functions
 * (technically less-than-N-argument functions since this is Javascript)
 * @param  {function} f Function to curry
 * @return {function} curried version of f
 */
function curry(f /*, arity */) {
	return curryArity(f, arguments.length > 1 ? arguments[1] : f.length, []);
}

function curryArity(fn, arity, args) {
	return function() {
		var accumulated = args.concat(slice.call(arguments));

		return accumulated.length < arity
			? curryArity(fn, arity, accumulated)
			: fn.apply(this, accumulated);
	};
}
