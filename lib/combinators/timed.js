var Stream = require('../Stream');
var Scheduler = require('../Scheduler');
var promise = require('../promises');
var step = require('../step');

var when = promise.when;
var delayed = promise.delay;
var Yield = step.Yield;
var Pair = step.Pair;
var yieldPair = step.yieldPair;
var ensureScheduler = Scheduler.ensure;

exports.periodic = periodic;
exports.delay = delay;
exports.debounce = debounce;

/**
 * Create a stream that emits the current time periodically
 * @param {Number} period
 * @param {?Scheduler} scheduler optional scheduler to use
 * @returns {Stream} new stream that emits the current time every period
 */
function periodic(period, scheduler) {
	return new Stream(function(p) {
		var now = p.state.now();
		return delayed(p.value, new Yield(now, p), p.state);
	}, new Pair(Math.max(1, period), ensureScheduler(scheduler)));
}


/**
 * @param {Number} delayTime milliseconds to delay each item
 * @param {Scheduler=} scheduler optional scheduler to use
 * @param {Stream} stream
 * @returns {Stream} new stream containing the same items, but delayed by ms
 */
function delay(delayTime, scheduler, stream) {
	scheduler = ensureScheduler(scheduler);

	var stepper = stream.step;
	return new Stream(function(s) {
		return when(function(i) {
			return i.done ? i
				: delayed(s.value, yieldPair(i, s.value), scheduler);
		}, when(stepper, s.state));
	}, new Pair(Math.max(0, delayTime), stream.state));
}

/**
 * Skip events for period time after the most recent event
 * @param {Number} period time to suppress events
 * @param {Scheduler=} scheduler optional scheduler
 * @param {Stream} stream
 * @returns {Stream} new stream that skips events for debounce period
 */
function debounce(period, scheduler, stream) {
	scheduler = ensureScheduler(scheduler);

	var stepper = stream.step;
	return new Stream(function(s) {
		return debounceNext(stepper, s, period, scheduler);
	}, new Pair(scheduler.now(), stream.state));
}

function debounceNext(stepper, s, period, scheduler) {
	return when(function(i) {
		if(i.done) {
			return i;
		}

		var now = scheduler.now();
		var end = s.value;
		return now > end ? yieldPair(i, now + period)
			: debounceNext(stepper, new Pair(end, i.state), period, scheduler);
	}, when(stepper, s.state));
}