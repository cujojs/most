var Promise = require('./promises').Promise;
var tail = require('./base').tail;

/**
 * Invoke the provided function, with the provided arguments,
 * as soon as possible after the current call stack clears
 * @param {function} f
 * @returns {Promise} promise for the result of invoking f
 */
module.exports = function asap(f /*,...args*/) {
	return Promise.resolve(tail(arguments)).then(function(args) {
		return dispatch(f, args);
	});
};

function dispatch(f, args) {
	/*jshint maxcomplexity:6*/
	switch(args.length) {
		case 0: return f();
		case 1: return f(args[0]);
		case 2: return f(args[0], args[1]);
		case 3: return f(args[0], args[1], args[2]);
		case 4: return f(args[0], args[1], args[2], args[3]);
		default: return f.apply(void 0, args);
	}
}