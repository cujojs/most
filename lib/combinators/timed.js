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
var Yield = step.Yield;
var Pair = step.Pair;
var yieldPair = step.yieldPair;
var ensureScheduler = Scheduler.ensure;

exports.periodic = periodic;
exports.periodicOn = periodicOn;
exports.delay = delay;
exports.delayOn = delayOn;
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

function throttle(period, stream) {
	return throttleOn(Scheduler.getDefault(), period, stream);
}

/**
 * Skip events for period time after the most recent event using
 * the provided scheduler
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