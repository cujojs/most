/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Stream = require('../Stream');
var reduce = require('../combinators/reduce').reduce;
var promise = require('../promises');
var step = require('../step');
var base = require('../base');

var replace = base.replace;
var copy = base.copy;
var map = base.map;

var raceIndex = promise.raceIndex;
var when = promise.when;
var Yield = step.Yield;
var End = step.End;

exports.merge = merge;
exports.mergeArray = mergeArray;
exports.mergeAll = mergeAll;

/**
 * @returns {Stream} observable containing events from all observables in the argument
 * list in time order.  If two events are simultaneous they will be merged in
 * arbitrary order.
 */
function merge(/*...observables*/) {
	return mergeArray(copy(arguments));
}

/**
 * @param {Array} streams array of observables to merge
 * @returns {Stream} observable containing events from all input observables
 * in time order.  If two events are simultaneous they will be merged in
 * arbitrary order.
 */
function mergeArray(streams) {
	return new Stream(stepMerge, map(initStep, streams));
}
/**
 * @param {Stream} streamOfStreams observable of observables
 * @returns {Stream} observable containing events from all observables in the
 * input in time order.  If two events are simultaneous they will be merged in
 * arbitrary order.
 */
function mergeAll(streamOfStreams) {
	return Stream.fromPromise(toArray(streamOfStreams)).flatMap(mergeArray);
}

function stepMerge(s) {
	if(s.length === 0) {
		return new End(0);
	}

	return stepEarliest(s[0].i === void 0 ? stepAll(s): s);
}

function stepAll (s) {
	return map(function (s) {
		return stepPair(s.stream);
	}, s);
}

function stepEarliest(s) {
	return raceIndex(function(i, index) {
		return handleStep(s, i, index);
	}, map(getIteration, s));
}

function handleStep(s, i, index) {
	return i.done ? stepMerge(without(index, s))
		: new Yield(i.time, i.value, stepAtIndex(s, i, index));
}

function stepAtIndex(s, i, index) {
	var sn = s[index];
	return replace(stepPair(sn.stream.beget(sn.stream.step, i.state)), index, s);
}

function stepPair(stream) {
	return { stream: stream, i: when(stream.step, stream.state) };
}

function initStep(s) {
	return { stream: s, i: void 0 };
}

function getIteration(s) {
	return s.i;
}

function without(i, a) {
	return a.filter(function(x, ai) {
		return i !== ai;
	});
}

function toArray (observableOfObservables) {
	return reduce(function (a, obs) {
		a.push(obs);
		return a;
	}, [], observableOfObservables);
}
