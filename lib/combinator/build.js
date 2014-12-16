/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var of = require('../source/core').of;
var flatMapEnd = require('./flatMapEnd').flatMapEnd;

exports.concat = concat;
exports.cycle = cycle;
exports.cons = cons;

/**
 * @param {*} x value to prepend
 * @param {Stream} stream
 * @returns {Stream} new stream with x prepended
 */
function cons(x, stream) {
	return concat(of(x), stream);
}

/**
 * @param {Stream} left
 * @param {Stream} right
 * @returns {Stream} new stream containing all events in left followed by all
 *  events in right.  This *timeshifts* right to the end of left.
 */
function concat(left, right) {
	return flatMapEnd(function() {
		return right;
	}, left);
}

/**
 * Tie stream into a circle, thus creating an infinite stream
 * @param {Stream} stream
 * @returns {Stream} new infinite stream
 */
function cycle(stream) {
	return flatMapEnd(function() {
		return cycle(stream);
	}, stream);
}
