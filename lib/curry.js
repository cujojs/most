/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var dispatch = require('./dispatch');
var concat = require('./base').concat;

module.exports = function curry(f, arity) {
	var a = arguments.length > 1 ? arity : f.length;
	return a < 2 ? f : curryArity(f, a, []);
};

function curryArity(f, arity, args) {
	return function() {
		var accum = concat(args, arguments);

		return accum.length < arity
			? curryArity(f, arity, accum)
			: dispatch(f, accum);
	};
}