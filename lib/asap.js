var resolve = require('./promises').Promise.resolve;
var tail = require('./base').tail;
var dispatch = require('./dispatch');

/**
 * Invoke the provided function, with the provided arguments,
 * as soon as possible after the current call stack clears
 * @param {function} f
 * @returns {Promise} promise for the result of invoking f
 */
module.exports = function asap(f /*,...args*/) {
	return resolve(tail(arguments)).then(function(args) {
		return dispatch(f, args);
	});
};
