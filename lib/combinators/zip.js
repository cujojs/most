/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Stream = require('../Stream');
var promise = require('../promises');
var step = require('../step');
var base = require('../base');
var dispatch = require('../dispatch');

var when = promise.when;
var all = promise.Promise.all;

var isDone = step.isDone;
var Yield = step.Yield;
var End = step.End;

var tail = base.tail;
var map = base.map;
var findIndex = base.findIndex;

exports.zip = zip;
exports.zipArray = zipArray;

/**
 * Combine events from all streams using f
 * @param {function(a:Stream, b:Stream, ...):*} f function to combine items
 * @returns {Stream} stream containing
 */
function zip(f /*,...streams*/) {
	return zipArray(f, tail(arguments));
}

/**
 * Combine events from all streams using f
 * @param {function(a:Stream, b:Stream, ...):*} f function to combine items
 * @param {Array} streams array of observables to zip
 * @returns {Stream} stream containing items from all input streams combined
 * using f
 */
function zipArray(f, streams) {
	return new Stream(function(ss) {
		return stepZip(f, ss);
	}, streams, void 0, disposeAll);
}

function stepZip (f, streams) {
	return all(map(streamNext, streams)).then(function (iterations) {
		return handleStepZip(f, streams, iterations);
	});
}

function handleStepZip(f, streams, iterations) {
	var done = findIndex(isDone, iterations);
	if(done < 0) {
		return applyZipWith(f, streams, iterations);
	}

	var ended = iterations[done];
	return new End(ended.time, ended.value, streams);
}

function disposeAll(t, x, streams) {
	return all(map(function(stream) {
		return stream.dispose(t, x, stream.state);
	}, streams));
}

function applyZipWith(f, streams, iterations) {
	var t = 0;
	var values = new Array(iterations.length);
	var states = new Array(iterations.length);

	var stream, it;
	for(var i=0, l=iterations.length; i<l; ++i) {
		stream = streams[i];
		it = iterations[i];

		if(it.time > t) {
			t = it.time;
		}

		values[i] = it.value;
		states[i] = stream.beget(stream.step, it.state);
	}

	return new Yield(t, dispatch(f, values), states);
}

function streamNext(s) {
	return when(s.step, s.state);
}
