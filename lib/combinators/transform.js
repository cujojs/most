/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var join = require('./join').join;
var promise = require('../promises');
var step = require('../step');
var cons = require('./extend').cons;

var when = promise.when;
var Yield = step.Yield;
var Pair = step.Pair;

exports.map = map;
exports.ap = ap;
exports.flatMap = flatMap;
exports.scan = scan;
exports.tap = tap;
exports.constant = constant;

/**
 * Transform each value in the stream by applying f to each
 * @param {function(*):*} f mapping function
 * @param {Stream} stream stream to map
 * @returns {Stream} stream containing items transformed by f
 */
function map(f, stream) {
	var stepper = stream.step;
	return stream.beget(function (state) {
		return mapNext(f, stepper, state);
	}, stream.state);
}

function mapNext (f, stepper, state) {
	return when(function (i) {
		return i.map(f);
	}, when(stepper, state));
}

/**
 * Replace each value in the stream with x
 * @param {*} x
 * @param {Stream} stream
 * @returns {Stream} stream containing items replaced with x
 */
function constant(x, stream) {
	return map(function(){
		return x;
	}, stream);
}

/**
 * Map each value in the stream to a new stream, and merge it into the
 * returned stream.
 * @param {function(x:*):Stream} f chaining function, must return a Stream
 * @param {Stream} stream
 * @returns {Stream} new stream containing all items from each stream returned by f
 */
function flatMap(f, stream) {
	return join(map(f, stream));
}

/**
 * Perform a side effect for each item in the stream
 * @param {function(x:*):*} f side effect to execute for each item. The
 *  return value will be discarded.
 * @param {Stream} stream stream to tap
 * @returns {Stream} new stream containing the same items as this stream
 */
function tap(f, stream) {
	var stepper = stream.step;
	return stream.beget(function (state) {
		return tapNext(f, stepper, state);
	}, stream.state);
}

function tapNext (f, stepper, state) {
	return when(function (i) {
		return i.done ? i : when(function() {
			return i;
		}, i.map(f));
	}, when(stepper, state));
}

/**
 * Assume fs is a stream containing functions, and apply each function to each value
 * in the xs stream.  This generates, in effect, a cross product.
 * @param {Stream} fs stream of functions to apply to the xs
 * @param {Stream} xs stream of values to which to apply all the fs
 * @returns {Stream} stream containing the cross product of items
 */
function ap(fs, xs) {
	return flatMap(function(f) {
		return map(f, xs);
	}, fs);
}

/**
 * Create a stream containing successive reduce results of applying f to
 * the previous reduce result and the current stream item.
 * @param {function(result:*, x:*):*} f reducer function
 * @param {*} initial initial value
 * @param {Stream} stream stream to scan
 * @returns {Stream} new stream containing successive reduce results
 */
function scan(f, initial, stream) {
	var scanStream = stream.begetWithDispose(function (s) {
		return stepScan(f, s);
	}, new Pair(initial, stream), disposeScan);

	return cons(initial, scanStream);
}

function stepScan (f, s) {
	var stream = s.state;
	return when(function (i) {
		if (i.done) {
			return i.withState(stream);
		}

		var x = f(s.value, i.value);
		return new Yield(i.time, x, new Pair(x, stream.beget(stream.step, i.state)));
	}, when(stream.step, stream.state));
}

function disposeScan(t, x, stream) {
	// Unwrap original stream's state from scan state
	var state = stream.state.state;
	return stream.dispose(t, x, state);
}
