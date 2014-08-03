/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var promise = require('./promises');
var step = require('./step');
var iterable = require('./iterable');
var base = require('./base');
var asap = require('./asap');

module.exports = Stream;

var Promise = promise.Promise;
var when = promise.when;
var neverPromise = promise.never;
var identity = base.identity;

var Yield = Stream.Yield = step.Yield;
var End   = Stream.End   = step.End;

var getState = step.getState;
var getValueOrFail = step.getValueOrFail;

var iterableFrom = iterable.from;
var iterableHead = iterable.head;

var never = new Stream(identity, neverPromise());

/**
 * Stream that generates items by repeatedly calling the provided
 * step function.  It will generate the first item by calling step with
 * the provided initial state.  The step function must return a Step,
 * which may Yield a value and a new state to be provided to the next
 * call to step.
 * @param {function(state:*):Step} step stream step function
 * @param {*} state initial state
 * @constructor
 */
function Stream(step, state) {
	this.step = step;
	this.state = state;
}

/**
 * @returns {Stream} stream that has no items and also never ends. Note that
 * this returns a singleton which can safely be compared with === to the result
 * of other calls to Stream.never().
 */
Stream.never = function() {
	return never;
};

/**
 * @param {*} x
 * @returns {Stream} stream that contains x as its only item
 */
Stream.of = function(x) {
	return new Stream(identity, once(x));
};

/**
 * Create a stream from an array-like or iterable
 * @param {Array|{iterator:function}|{next:function}|{length:Number}} iterable Array,
 *  array-like, iterable, or iterator
 * @returns {Stream} stream containing all items from the iterable
 */
Stream.from = function(iterable) {
	return new Stream(iterableHead, iterableFrom(iterable));
};

/**
 * @param {Promise} p
 * @returns {Stream} stream containing p's fulfillment value as its only item
 */
Stream.fromPromise = function(p) {
	return new Stream(identity, p.then(once));
};

/**
 * Observe all items in the stream
 * @param {function(*):undefined|Promise} f function which will be called
 *  for each item in the stream.  It may return a promise to exert a simple
 *  form of back pressure: f is guaranteed not to receive the next item in
 *  the stream before the promise fulfills.  Returning a non-promise has no
 *  effect on back pressure
 * @returns {Promise} promise that fulfills after all items have been observed,
 *  and the stream has ended.
 */
Stream.prototype.forEach = Stream.prototype.observe = function(f) {
	return asap(runStream, f, this.step, this.state);
};

function runStream(f, stepper, state) {
	return when(function (s) {
		if (s.done) {
			return s.value;
		}

		return when(function (x) {
			return x instanceof End ? x.value
				: runStream(f, stepper, s.state);
		}, f(s.value));
	}, when(stepper, state));
}

/**
 * @returns {Promise} a promise for the first item in the stream
 */
Stream.prototype.head = function() {
	return when(getValueOrFail, Promise.resolve(streamNext(this)));
};

/**
 * @returns {Stream} a stream containing all items in this stream except the first
 */
Stream.prototype.tail = function() {
	return new Stream(this.step, when(getState, streamNext(this)));
};

// Helpers

function streamNext(s) {
	return when(s.step, s.state);
}

function once(x) {
	return new Yield(x, new End());
}
