/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var promise = require('../promises');
var step = require('../step');
var base = require('../base');
var empty = require('./monoid').empty;
var dispatch = require('../dispatch');

var replace = base.replace;
var tail = base.tail;
var map = base.map;

var when = promise.when;
var all = promise.Promise.all;

var getValue = step.getValue;
var Yield = step.Yield;
var unamb = step.unamb;

exports.combine = combine;
exports.combineArray = combineArray;

/**
 * Combine latest events from all input streams
 * @param {function(...events):*} f function to combine most recent events
 * @returns {Stream} stream containing the result of applying f to the most recent
 *  event of each input stream, whenever a new event arrives on any stream.
 */
function combine(f /*,...streams*/) {
	return combineArray(f, tail(arguments));
}

/**
 * Combine streams
 * @param {function(...events):*} f function to combine most recent events
 * @param {[*]} array most recent events
 * @returns {Stream} stream containing the result of applying f to the most recent
 *  event of each input stream, whenever a new event arrives on any stream.
 */
function combineArray(f, array) {
	if(array.length === 0) {
		return empty();
	}

	if(array.length === 1) {
		return array[0].map(f);
	}

	return new Stream(function(s) {
		return stepCombine(f, s);
	}, map(initTuple, array), void 0, disposeRemaining);
}

function stepCombine(f, s) {
	var first = s[0];
	return first.i === first.stream ? initAll(f, s) : stepEarliest(f, s);
}

function initAll (f, s) {
	var steps = map(stepTuple, s);
	return all(map(getI, steps)).then(function (is) {
		return handleInitStep(f, s, steps, is);
	});
}

function handleInitStep(f, s, steps, is) {
	var time = 0;
	var iteration;
	for (var i = 0; i < is.length; ++i) {
		iteration = is[i];

		if (iteration.done) {
			return iteration.withState(s);
		}

		if (iteration.time > time) {
			time = iteration.time;
		}
	}

	return yieldNext(time, f, is, map(stepTuple, steps));
}

function stepEarliest(f, s) {
	return unamb(function(i, index) {
		return handleCombineStep(f, s, i, index);
	}, map(getI, s));
}

function handleCombineStep(f, s, i, index) {
	if(i.done) {
		return i.withState(s);
	}

	var nexts = replace(makeTuple(s[index], i), index, s);
	return all(map(getValue, nexts)).then(function(iterations) {
		return yieldNext(i.time, f, iterations, stepAtIndex(nexts, index));
	});
}

function yieldNext(t, f, iterations, tuples) {
	return new Yield(t, dispatch(f, map(getValue, iterations)), tuples);
}

function stepAtIndex(tuples, index) {
	return replace(stepTuple(tuples[index]), index, tuples);
}

function initTuple(stream) {
	return { stream: stream, i: stream, value: void 0 };
}

function makeTuple(tuple, i) {
	return { stream: tuple.stream, i: i, value: tuple.i };
}

function stepTuple(tuple) {
	var stream = tuple.stream;
	var i = when(function(i) {
		return stream.step(i.state);
	}, tuple.i);

	return makeTuple(tuple, i);
}

function getI(tuple) {
	return tuple.i;
}

function disposeRemaining(t, x, remaining) {
	return all(map(function(s) {
		return disposeOne(t, x, s.stream, s.i);
	}, remaining));
}

function disposeOne(t, x, stream, i) {
	return when(function(i) {
		return stream.dispose(t, x, i.state);
	}, i);
}
