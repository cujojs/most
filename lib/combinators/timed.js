/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Stream = require('../Stream');
var Scheduler = require('../Scheduler');
var promise = require('../promises');
var step = require('../step');

var when = promise.when;
var delayed = promise.delay;
var never = promise.never;
var raceIndex = promise.raceIndex;
var Yield = step.Yield;
var Pair = step.Pair;
var yieldPair = step.yieldPair;
var ensureScheduler = Scheduler.ensure;

exports.periodic = periodic;
exports.periodicOn = periodicOn;
exports.delay = delay;
exports.delayOn = delayOn;
exports.debounce = debounce;
exports.debounceOn = debounceOn;
exports.throttle = throttle;
exports.throttleOn = throttleOn;

/**
 * Create a stream that emits the current time periodically
 * @param {Number} period
 * @returns {Stream} new stream that emits the current time every period
 */
function periodic(period) {
	return periodicOn(Scheduler.getDefault(), period);
}

/**
 * Create a stream that emits the current time periodically using
 * the provided scheduler
 * @param {Scheduler} scheduler
 * @param {Number} period
 * @returns {Stream} new stream that emits the current time every period
 */
function periodicOn(scheduler, period) {
	return new Stream(function(p) {
		var now = p.state.now();
		return delayed(p.value, new Yield(now, p), p.state);
	}, new Pair(Math.max(1, period), ensureScheduler(scheduler)));
}


/**
 * @param {Number} delayTime milliseconds to delay each item using
 * the provided scheduler
 * @param {Stream} stream
 * @returns {Stream} new stream containing the same items, but delayed by ms
 */
function delay(delayTime, stream) {
	return delayOn(Scheduler.getDefault(), delayTime, stream);
}

/**
 * @param {Scheduler} scheduler
 * @param {Number} delayTime milliseconds to delay each item
 * @param {Stream} stream
 * @returns {Stream} new stream containing the same items, but delayed by ms
 */
function delayOn(scheduler, delayTime, stream) {
	var stepper = stream.step;
	return new Stream(function(s) {
		return when(function(i) {
			return i.done ? i
				: delayed(s.value, yieldPair(i, s.value), scheduler);
		}, when(stepper, s.state));
	}, new Pair(Math.max(0, delayTime), stream.state));
}

/**
 * Limit the rate of events
 * stream:              abcd----abcd----
 * throttle(2, stream): a-c-----a-c-----
 * @param {Number} period time to suppress events
 * @param {Stream} stream
 * @returns {Stream}
 */
function throttle(period, stream) {
	return throttleOn(Scheduler.getDefault(), period, stream);
}

/**
 * Limit the rate of events
 * stream:              abcd----abcd----
 * throttle(2, stream): a-c-----a-c-----
 * @param {Scheduler} scheduler
 * @param {Number} period time to suppress events
 * @param {Stream} stream
 * @returns {Stream} new stream that skips events for period
 */
function throttleOn(scheduler, period, stream) {
	scheduler = ensureScheduler(scheduler);

	var stepper = stream.step;
	return new Stream(function(s) {
		return throttleNext(stepper, s, period, scheduler);
	}, new Pair(-1, stream.state));
}

function throttleNext(stepper, s, period, scheduler) {
	return when(function(i) {
		if(i.done) {
			return i;
		}

		var now = scheduler.now();
		var end = s.value;
		return now > end ? yieldPair(i, now + period)
			: throttleNext(stepper, new Pair(end, i.state), period, scheduler);
	}, when(stepper, s.state));
}

/**
 * Wait for a burst of events to subside and emit only the last event in the burst
 * stream:              abcd----abcd----
 * debounce(2, stream): -----d-------d--
 * @param {Number} period events occuring more frequently than this
 *  will be suppressed
 * @param {Stream} stream stream to debounce
 * @returns {Stream} new debounced stream
 */
function debounce(period, stream) {
	return debounceOn(Scheduler.getDefault(), period, stream);
}

/**
 * Wait for a burst of events to subside and emit only the last event in the burst
 * stream:              abcd----abcd----
 * debounce(2, stream): -----d-------d--
 * @param {Scheduler} scheduler
 * @param {Number} period events occuring more frequently than this
 *  on the provided scheduler will be suppressed
 * @param {Stream} stream stream to debounce
 * @returns {Stream} new debounced stream
 */
function debounceOn(scheduler, period, stream) {
	var stepper = stream.step;
	return new Stream(function(s) {
		return stepDebounce(scheduler, period, stepper, s);
	}, { timer: void 0, prev: void 0, next: void 0, state: stream.state });
}

function stepDebounce(scheduler, period, step, s) {
	return stepEarliest(scheduler, period, step, s.timer === void 0 ? initState(step, s) : s);
}

function stepEarliest(scheduler, period, step, s) {
	return raceIndex(function(winner, index) {
		return index === 0 ? yieldDebounced(s)
			: winner.done ? winner
			: stepEarliest(scheduler, period, step, nextState(scheduler, period, step, winner));
	}, [s.timer, s.next]);
}

function initState(step, s) {
	return { timer: never(), prev: s.prev, next: when(step, s.state), state: s.state };
}

function nextState (scheduler, period, step, winner) {
	return { timer: delayed(period, 'timer', scheduler), prev: winner,
		next: when(step, winner.state), state: winner.state };
}

function yieldDebounced(s) {
	return when(function (prev) {
		return new Yield(prev.value, { timer: never(), prev: void 0,
			next: s.next, state: prev.state });
	}, s.prev);
}