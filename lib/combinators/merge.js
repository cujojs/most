/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Stream = require('../Stream');
var reduce = require('./reduce').reduce;
var empty = require('./monoid').empty;
var promise = require('../promises');
var unamb = require('../step').unamb;
var base = require('../base');

var replace = base.replace;
var copy = base.copy;
var map = base.map;

var all = promise.Promise.all;
var when = promise.when;

exports.merge = merge;
exports.mergeArray = mergeArray;
exports.mergeAll = mergeAll;

/**
 * @returns {Stream} stream containing events from all streams in the argument
 * list in time order.  If two events are simultaneous they will be merged in
 * arbitrary order.
 */
function merge(/*...streams*/) {
	return mergeArray(copy(arguments));
}

/**
 * @param {Array} streams array of stream to merge
 * @returns {Stream} stream containing events from all input observables
 * in time order.  If two events are simultaneous they will be merged in
 * arbitrary order.
 */
function mergeArray(streams) {
	if(streams.length === 0) {
		return empty();
	}

	if(streams.length === 1) {
		return streams[0];
	}

	return new Stream(stepMerge, map(initStep, streams), void 0, disposeRemaining);
}
/**
 * @param {Stream} streamOfStreams stream of streams to merge
 * @returns {Stream} stream containing events from all observables in the
 * input in time order.  If two events are simultaneous they will be merged in
 * arbitrary order.
 */
function mergeAll(streamOfStreams) {
	// TODO: implement a solution that doesn't involve converting to an array first
	// We should be able to merge an infinite stream of streams.
	return Stream.fromPromise(toArray(streamOfStreams)).flatMap(mergeArray);
}

function stepMerge(s) {
	return stepEarliest(s[0].i === null ? stepAll(s): s);
}

function stepAll (s) {
	return map(function (s) {
		return stepPair(s.stream);
	}, s);
}

function stepEarliest(s) {
	return unamb(function(i, index) {
		return handleStep(i, index, s);
	}, map(getIteration, s));
}

function handleStep(i, index, s) {
	if(i.done) {
		var sp = without(i, index, s);
		if(s.length === 1) {
			return when(function(s) {
				return i.withState(s);
			}, sp);
		}

		return when(stepMerge, sp);
	}

	return i.withState(stepAtIndex(i, index, s));
}

function stepAtIndex(i, index, s) {
	var sn = s[index];
	return replace(stepPair(sn.stream.beget(sn.stream.step, i.state)), index, s);
}

function stepPair(stream) {
	return { stream: stream, i: when(stream.step, stream.state) };
}

function initStep(s) {
	return { stream: s, i: null };
}

function getIteration(s) {
	return s.i;
}

function disposeRemaining(t, x, remaining) {
	return all(map(function(s) {
		return s.stream.dispose(t, x, s.stream.state);
	}, remaining));
}

function without(step, index, arr) {
	var stream = arr[index].stream;
	return when(function() {
		return arr.filter(function(x, ai) {
			return index !== ai;
		});
	}, stream.dispose(step.time, step.value, step.state));
}

function toArray (observableOfObservables) {
	return reduce(function (a, obs) {
		a.push(obs);
		return a;
	}, [], observableOfObservables);
}
