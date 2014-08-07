/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Stream = require('../Stream');
var promise = require('../promises');
var step = require('../step');
var base = require('../base');

var when = promise.when;
var Promise = promise.Promise;

var isDone = step.isDone;
var Yield = step.Yield;

var tail = base.tail;
var copy = base.copy;
var findIndex = base.findIndex;

exports.zipWith = zipWith;
exports.zip = zip;
exports.zipArray = zipArray;
exports.zipArrayWith = zipArrayWith;

/**
 * Combine events from all observables using f
 * @param {function(a:Stream, b:Stream, ...):*} f function to combine items
 * @returns {Stream} observable containing
 */
function zipWith(f /*,...observables*/) {
	return zipArrayWith(f, tail(arguments));
}

/**
 * Combine events from all observables by collecting them into an array
 * @returns {*}
 */
function zip(/*...observables*/) {
	return zipArrayWith(Array, copy(arguments));
}

/**
 * Combine events from all observables by collecting them into an array
 * @param {Array} observables array of observables to zip
 * @returns {*}
 */
function zipArray(observables) {
	return zipArrayWith(Array, observables);
}

/**
 * Combine events from all observables using f
 * @param {function(a:Stream, b:Stream, ...):*} f function to combine items
 * @param {Array} observables array of observables to zip
 * @returns {Stream} observable containing
 */
function zipArrayWith(f, observables) {
	return new Stream(function(ss) {
		return stepZip(f, ss);
	}, observables);
}

function stepZip (f, streams) {
	return Promise.all(streams.map(streamNext)).then(function (iterations) {
		var done = findIndex(isDone, iterations);
		if(done >= 0) {
			return iterations[done];
		}

		return applyZipWith(f, streams, iterations);
	});
}

function applyZipWith(f, streams, iterations) {
	var t = 0;
	var values = new Array(iterations.length);
	var states = new Array(iterations.length);

	for(var i=0, l=iterations.length; i<l; ++i) {
		var it = iterations[i];
		if(it.time > t) {
			t = it.time;
		}

		values[i] = it.value;
		states[i] = streams[i].beget(streams[i].step, it.state);
	}

	return new Yield(t, f.apply(void 0, values), states);
}

function streamNext(s) {
	return when(s.step, s.state);
}

