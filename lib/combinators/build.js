/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Stream = require('../Stream');
var identity = require('../base').identity;
var Pair = require('../step').Pair;

var Yield = Stream.Yield;

exports.unfold = unfold;
exports.iterate = iterate;
exports.repeat = repeat;

/**
 * Build a stream by unfolding steps from a seed value
 * @param {function(x:*):Step} f
 * @param {*} x seed value
 * @returns {Stream} stream containing all items
 */
function unfold(f, x) {
	return new Stream(f, x);
}

/**
 * Build a stream by iteratively calling f
 * @param {function(x:*):*} f
 * @param {*} x initial value
 * @returns {Stream}
 */
function iterate(f, x) {
	return new Stream(function(s) {
		var scheduler = s.state;
		return new Yield(scheduler.now(), s.value, new Pair(f(s.value), scheduler));
	}, new Pair(x, Stream.getDefaultScheduler()));
}

/**
 * Create an infinite stream of xs
 * @param {*} x
 * @returns {Stream} infinite stream where all items are x
 */
function repeat(x) {
	return iterate(identity, x);
}
