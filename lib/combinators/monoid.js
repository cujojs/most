/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Stream = require('../Stream');
var step = require('../step');
var identity = require('../base').identity;
var when = require('../promises').when;

var End = step.End;

exports.empty = empty;
exports.concat = concat;

/**
 * @returns {Stream} stream that contains no items, and immediately ends
 */
function empty() {
	return new Stream(identity, new End(Stream.getDefaultScheduler().now()));
}

/**
 * @param {Stream} left
 * @param {Stream} right
 * @returns {Stream} new stream containing all items in left followed by
 *  all items in right
 */
function concat(left, right) {
	return new Stream(stepConcat, { stream: left, state: left.state, tail: right }, void 0, disposeCurrent);
}

function stepConcat(s) {
	return when(function(i) {
		return handleStep(s, i);
	}, s.stream.step(s.state));
}

function handleStep(s, i) {
	if(i.done) {
		return when(function() {
			return yieldTailOrEnd(s, i);
		}, s.stream.dispose(i.time, i.value, i.state));
	}

	return i.withState({ stream: s.stream, state: i.state, tail: s.tail });
}

function yieldTailOrEnd(s, i) {
	var tail = s.tail;
	return tail === null ? i.withState({ stream: s.stream, state: i.state, tail: null }) :
		   stepConcat({ stream: tail, state: tail.state, tail: null });
}

function disposeCurrent(t, x, s) {
	return s.stream.dispose(t, x, s.state);
}
