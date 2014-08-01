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
var getValue = step.getValue;
var Yield = step.Yield;
var End = step.End;

var tail = base.tail;
var copy = base.copy;

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
	return Promise.all(streams.map(streamNext)).then(function (is) {
		if (is.some(isDone)) {
			return new End();
		}

		var value = f.apply(void 0, is.map(getValue));
		return new Yield(value, is.map(function (it, i) {
			return new Stream(streams[i].step, it.state);
		}));
	});
}

function streamNext(s) {
	return when(s.step, s.state);
}

