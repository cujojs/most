/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Stream = require('../Stream');
var promise = require('../promises');
var step = require('../step');

var raceIndex = promise.raceIndex;
var when = promise.when;
var Yield = step.Yield;
var End = step.End;

var slice = Array.prototype.slice;

exports.merge = merge;
exports.mergeArray = mergeArray;
exports.mergeAll = mergeAll;

/**
 * @returns {Stream} observable containing events from all observables in the argument
 * list in time order.  If two events are simultaneous they will be merged in
 * arbitrary order.
 */
function merge(/*...observables*/) {
	return mergeArray(slice.call(arguments));
}

/**
 * @param {Array} observables array of observables to merge
 * @returns {Stream} observable containing events from all input observables
 * in time order.  If two events are simultaneous they will be merged in
 * arbitrary order.
 */
function mergeArray(observables) {
	return new Stream(stepMerge, observables.map(initStep));
}
/**
 * @param {Stream} observableOfObservables observable of observables
 * @returns {Stream} observable containing events from all observables in the
 * input in time order.  If two events are simultaneous they will be merged in
 * arbitrary order.
 */
function mergeAll(observableOfObservables) {
	return Stream.fromPromise(toArray(observableOfObservables)).flatMap(mergeArray);
}

function stepMerge(s) {
	if(s.length === 0) {
		return new End();
	}

	return stepEarliest(s[0].i === void 0 ? stepAll(s): s);
}

function stepAll (s) {
	return s.map(function (s) {
		return stepPair(s.stream);
	});
}

function stepEarliest(s) {
	return raceIndex(function(i, index) {
		return handleStep(s, i, index);
	}, s.map(getI));
}

function handleStep(s, i, index) {
	return i.done ? stepMerge(without(index, s))
		: new Yield(i.value, stepAtIndex(s, i, index));
}

function stepAtIndex(s, i, index) {
	return s.map(function (sn, j) {
		return j === index ? stepPair(new Stream(sn.stream.step, i.state)) : sn;
	});
}

function stepPair(stream) {
	return { stream: stream, i: when(stream.step, stream.state) };
}

function initStep(s) {
	return { stream: s, i: void 0 };
}

function getI(s) {
	return s.i;
}

function without(i, a) {
	return a.filter(function(x, ai) {
		return i !== ai;
	});
}

function toArray (observableOfObservables) {
	return observableOfObservables.reduce(function (a, obs) {
		a.push(obs);
		return a;
	}, []);
}
