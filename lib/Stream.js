/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Scheduler = require('./Scheduler');
var promise = require('./promises');
var step = require('./step');
var iterable = require('./iterable');
var base = require('./base');

module.exports = Stream;

//var Promise = promise.Promise;
var when = promise.when;
var resolve = promise.Promise.resolve;
var neverPromise = promise.never;
var identity = base.identity;

var Yield = Stream.Yield = step.Yield;
var End   = Stream.End   = step.End;

var getState = step.getState;
var getValueOrFail = step.getValueOrFail;

var iterableFrom = iterable.from;
var iterableHead = iterable.head;

var never = new Stream(identity, neverPromise());

Stream.getDefaultScheduler = getDefaultScheduler;
Stream.setDefaultScheduler = setDefaultScheduler;

var defaultScheduler;

function getDefaultScheduler() {
	if(defaultScheduler === void 0) {
		defaultScheduler = new Scheduler();
	}
	return defaultScheduler;
}

function setDefaultScheduler(scheduler) {
	if(scheduler != null) {
		defaultScheduler = scheduler;
	}
}

/**
 * Stream that generates items by repeatedly calling the provided
 * step function.  It will generate the first item by calling step with
 * the provided initial state.  The step function must return a Step,
 * which may Yield a value and a new state to be provided to the next
 * call to step.
 * @param {function(state:*):Step} step stream step function
 * @param {*} state initial state
 * @param {Scheduler=} scheduler
 * @constructor
 */
function Stream(step, state, scheduler, dispose) {
	this.step = step;
	this.state = state;
	this.scheduler = scheduler === void 0 ? getDefaultScheduler() : scheduler;
	this.dispose = typeof dispose === 'function' ? dispose : returnEndValue;
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
	return new Stream(iterableHead, scheduledIterable(iterable));
};

/**
 * @param {Promise} p
 * @returns {Stream} stream containing p's fulfillment value as its only item
 */
Stream.fromPromise = function(p) {
	return new Stream(identity, resolve(p).then(once));
};

/**
 * @param {function(state:*):Step} step
 * @param {*} state
 * @returns {Stream} new stream with the supplied stepper and state, which shares
 * this stream's scheduler and dispose function
 */
Stream.prototype.beget = function(step, state) {
	return new Stream(step, state, this.scheduler, this.dispose);
};

/**
 * @param {function(state:*):Step} step
 * @param {*} state
 * @param {function(s:Stream, endValue:*, end:End):*} dispose
 * @returns {Stream} new stream with the supplied stepper, state, and dispose
 * function, which shares this stream's scheduler
 */
Stream.prototype.begetWithDispose = function(step, state, dispose) {
	return new Stream(step, state, this.scheduler, dispose);
};

/**
 * @returns {Promise} a promise for the first item in the stream
 */
Stream.prototype.head = function() {
	return resolve(streamNext(this)).then(getValueOrFail);
};

/**
 * @returns {Stream} a stream containing all items in this stream except the first
 */
Stream.prototype.tail = function() {
	return this.beget(this.step, when(getState, streamNext(this)));
};

// Helpers

function streamNext(s) {
	return when(s.step, s.state);
}

function once(x) {
	var t = getDefaultScheduler().now();
	return new Yield(t, x, new End(t));
}

function scheduledIterable(iterable) {
	return iterableFrom(getDefaultScheduler(), iterable);
}

function returnEndValue(t, x) {
	return x;
}
