/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

exports.curry2 = curry2;
exports.curry3 = curry3;
exports.curryn = curryn;

/**
 * Curry with exactly 2 arguments
 * @param {function(a:*, b:*):*} f 2-arg function to curry
 * @return {Function} curried f
 */
function curry2(f) {
	return function(a, b) {
		switch(arguments.length) {
			case 0: return f;
			case 1: return function(b) { return f(a, b); };
			default: return f(a, b);
		}
	};
}

/**
 * Curry with exactly 3 arguments
 * @param {function(a:*, b:*, c:*):*} f 3-arg function to curry
 * @return {Function} curried f
 */
function curry3(f) {
	return function(a, b, c) {
		switch(arguments.length) {
			case 0: return f;
			case 1: return curry2(function(a, b) { return f(a, b, c); });
			case 2: return function(c) { return f(a, b, c); };
			default: return f(a, b, c);
		}
	};
}

/**
 * Curry a varargs function, where n is the minimum number of
 * arguments for f to be invoked.
 * @param {number} n minimum number of arguments
 * @param {function(...args):*} f varargs function to curry
 * @return {function} curried f
 */
function curryn(n, f) {
	return curryArgs(n, f, []);
}

function curryArgs(n, f, args) {
	return function() {
		var l1 = args.length;
		var l2 = arguments.length;
        var remaining = n - l2;

		var a = new Array(l1 + l2);
		var i;
		for(i=0; i<l1; ++i) {
			a[i] = args[i];
		}
		for(i=0; i<l2; ++i) {
			a[l1+i] = arguments[i];
		}

		return remaining > 0 ? curryArgs(remaining, f, a)
			 : f.apply(void 0, a);
	};
}
