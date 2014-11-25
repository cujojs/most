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

var emptyStream = new Stream(identity, new End(0));

/**
 * @returns {Stream} stream that contains no items, and immediately ends
 */
function empty() {
	return emptyStream;
}

/**
 * @param {Stream} left
 * @param {Stream} right
 * @returns {Stream} new stream containing all items in left followed by
 *  all items in right
 */
function concat(left, right) {
	return new Stream(stepConcat, { stream: left, tail: right }, void 0, disposeCurrent);
}

function stepConcat(s) {
	return when(function(i) {
		return handleStep(s, i);
	}, s.stream.step(s.stream.state));
}

function handleStep(s, i) {
	if(i.done) {
		return when(function() {
			return yieldTailOrEnd(s, i);
		}, s.stream.dispose(i.time, i.value, i.state));
	}

	return i.withState({ stream: s.stream.beget(s.stream.step, i.state), tail: s.tail });
}

function yieldTailOrEnd(s, i) {
	var tail = s.tail;
	return tail === null ? i.withState({ stream: emptyStream, tail: null }) :
		   stepConcat({ stream: tail, tail: null });
}

function disposeCurrent(t, x, s) {
	var result = disposeStream(t, x, s.stream);
	if(s.tail === null) {
		return result;
	}
	return when(function() {
		return disposeStream(t, x, s.tail);
	}, result);
}

function disposeStream(t, x, stream) {
	return stream.dispose(t, x, stream.state);
}