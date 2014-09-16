/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var dispatch = require('./dispatch');
var base = require('./base');
var copy = base.copy;
var concat = base.concat;

var paramsRx = /function[^(]*\(([^)]*)/;

module.exports = curry;

function curry(f, arity) {
	var a = arguments.length > 1 ? arity : f.length;
	return a < 2 ? f : compile(f, a);
}

function compile(f, arity) {
	/*jshint evil:true*/
	var m = paramsRx.exec(f.toString());
	var body = 'return function ' + f.name + '_$curried (' + m[1] + ') {\n' +
			'  var a = copy(arguments);\n' +
			'  return a.length < arity\n' +
				'    ? curryArity(f, arity, a) : dispatch(f, a);\n' +
		'};';

	return (new Function('copy', 'dispatch', 'curryArity', 'f', 'arity', body)
		(copy, dispatch, curryArity, f, arity));
}

function curryArity(f, arity, args) {
	return function() {
		var accum = concat(args, arguments);

		return accum.length < arity
			? curryArity(f, arity, accum)
			: dispatch(f, accum);
	};
}

