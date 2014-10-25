/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Stream = require('../Stream');
var promise = require('../promises');
var step = require('../step');

var when = promise.when;
var resolve = promise.Promise.resolve;
var delayed = promise.delay;
var never = promise.never;
var Yield = step.Yield;
var Pair = step.Pair;
var unamb = step.unamb;
var yieldPair = step.yieldPair;

exports.periodic = periodic;
exports.periodicOn = periodicOn;
exports.delay = delay;
exports.delayOn = delayOn;
exports.debounce = debounce;
exports.debounceOn = debounceOn;
exports.throttle = throttle;
exports.throttleOn = throttleOn;
exports.sync = sync;

/**
 * Create a stream that emits the current time periodically
 * @param {Number} period
 * @returns {Stream} new stream that emits the current time every period
 */
function periodic(period) {
	return periodicOn(Stream.getDefaultScheduler(), period);
}

/**
 * @private
 * Create a stream that emits the current time periodically using
 * the provided scheduler
 * @param {Scheduler} scheduler
 * @param {Number} period
 * @returns {Stream} new stream that emits the current time every period
 */
function periodicOn(scheduler, period) {
	var stream = new Stream(function (s) {
		return new Yield(s, s, s + period);
	}, scheduler.now(), scheduler);

	return skipPast(period, sync(stream));
}

/**
 * Skip all events that are in the past, as determined by the supplied
 * stream's scheduler
 * @private
 * @param {Number} threshold events older than this will be skipped
 * @param stream
 * @returns {Stream}
 */
function skipPast(threshold, stream) {
	return stream.beget(function(s) {
		return stepSkipPast(threshold, stream.scheduler, stream.step, s);
	}, stream.state);
}

function stepSkipPast (threshold, scheduler, stepper, s) {
	return when(function (i) {
		return i.time + threshold >= scheduler.now() ? i
			: stepSkipPast(threshold, scheduler, stepper, i.state);
	}, resolve(s).then(stepper));
}

/**
 * Synchronize a stream's items with its scheduler, ensuring that
 * items are emitted only at their specified time
 * @private
 * @param {Stream} stream stream to synchronize
 * @returns {Stream} new stream whose items are synchronized to the
 * stream's scheduler
 */
function sync(stream) {
	return stream.beget(makeSyncStepper(stream.scheduler, stream.step), stream.state);
}

function makeSyncStepper(scheduler, stepper) {
	return function (s) {
		return syncStep(scheduler, stepper, s);
	};
}

function syncStep (scheduler, stepper, s) {
	return when(function (i) {
		return getSyncStep(scheduler, i);
	}, when(stepper, s));
}

function getSyncStep (scheduler, i) {
	var now = scheduler.now();
	return now < i.time ? delayed(i.time - now, i, scheduler) : i;
}

/**
 * @param {Number} delayTime milliseconds to delay each item using
 * the provided scheduler
 * @param {Stream} stream
 * @returns {Stream} new stream containing the same items, but delayed by ms
 */
function delay(delayTime, stream) {
	return delayOn(ensureScheduler(stream.scheduler), delayTime, stream);
}

/**
 * @private
 * @param {Scheduler} scheduler
 * @param {Number} delayTime milliseconds to delay each item
 * @param {Stream} stream
 * @returns {Stream} new stream containing the same items, but delayed by ms
 */
function delayOn(scheduler, delayTime, stream) {
	var stepDelay = delayStep(delayTime);
	var stepper = stream.step;
	return stream.beget(makeSyncStepper(scheduler, function(s) {
		return when(stepDelay, when(stepper, s));
	}), stream.state);
}

function delayStep(dt) {
	return function(i) {
		return i.delay(dt);
	};
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
	return throttleOn(ensureScheduler(stream.scheduler), period, stream);
}

/**
 * @private
 * Limit the rate of events
 * stream:              abcd----abcd----
 * throttle(2, stream): a-c-----a-c-----
 * @param {Scheduler} scheduler
 * @param {Number} period time to suppress events
 * @param {Stream} stream
 * @returns {Stream} new stream that skips events for period
 */
function throttleOn(scheduler, period, stream) {
	var stepper = stream.step;
	return stream.beget(function(s) {
		return throttleNext(stepper, s, period, scheduler);
	}, new Pair(-1, stream.state));
}

function throttleNext(stepper, s, period, scheduler) {
	return when(function(i) {
		if(i.done) {
			return i.withState(s.state);
		}

		return i.time > s.value ? yieldPair(i, i.time + period)
			: throttleNext(stepper, new Pair(s.value, i.state), period, scheduler);
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
	return debounceOn(ensureScheduler(stream.scheduler), period, stream);
}

/**
 * @private
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
	return stream.beget(function(s) {
		return stepDebounce(scheduler, period, stepper, s);
	}, { timer: void 0, prev: void 0, next: void 0, state: stream.state });
}

function stepDebounce(scheduler, period, step, s) {
	return stepEarliest(scheduler, period, step, s.timer === void 0 ? initState(step, s) : s);
}

function stepEarliest(scheduler, period, step, s) {
	return unamb(function(winner, index) {
		return index > 0 ? yieldDebounced(s)
			: winner.done ? winner.withState(s.state)
			: stepEarliest(scheduler, period, step, nextState(scheduler, period, step, winner));
	}, [s.next, s.timer]);
}

function initState(step, s) {
	return { timer: never(), prev: s.prev, next: when(step, s.state), state: s.state };
}

function nextState (scheduler, period, step, winner) {
	return { timer: delayed(period, new Yield(scheduler.now() + period, 'timer'), scheduler), prev: winner,
		next: when(step, winner.state), state: winner.state };
}

function yieldDebounced(s) {
	return when(function (prev) {
		return new Yield(prev.time, prev.value, { timer: never(), prev: void 0,
			next: s.next, state: prev.state });
	}, s.prev);
}

function ensureScheduler(scheduler) {
	if(typeof scheduler === 'undefined') {
		return Stream.getDefaultScheduler();
	}
	return scheduler;
}
