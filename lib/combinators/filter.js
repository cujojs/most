/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var promise = require('../promises');
var step = require('../step');

var when = promise.when;

var Yield = step.Yield;
var End = step.End;
var unamb = step.unamb;
var Pair = step.Pair;
var yieldPair = step.yieldPair;

var init = {};

exports.filter = filter;
exports.takeUntil = takeUntil;
exports.take = take;
exports.takeWhile = takeWhile;
exports.distinct = distinct;
exports.distinctBy = distinctBy;

/**
 * Retain only items matching a predicate
 * stream:                           -12345678-
 * filter(x => x % 2 === 0, stream): --2-4-6-8-
 * @param {function(x:*):boolean} p filtering predicate called for each item
 * @param {Stream} stream stream to filter
 * @returns {Stream} stream containing only items for which predicate returns truthy
 */
function filter(p, stream) {
	var stepper = stream.step;
	return stream.beget(function(state) {
		return filterNext(p, stepper, state);
	}, stream.state);
}

function filterNext(p, stepper, state) {
	return when(function(i) {
		return i.done || p(i.value) ? i
			: filterNext(p, stepper, i.state);
	}, when(stepper, state));
}

/**
 * stream:          -abcd-
 * take(2, stream): -ab
 * @param {function(x:*):boolean} p
 * @param {Stream} stream stream from which to take
 * @returns {Stream} stream containing items up to, but not including, the
 * first item for which p returns falsy.
 */
function takeWhile(p, stream) {
	var stepper = stream.step;
	return stream.beget(function(s) {
		return when(function (i) {
			return i.done || p(i.value) ? i
				: new End(i.time, i.value, i.state);
		}, when(stepper, s));
	}, stream.state);
}

/**
 * stream:                        -123451234-
 * takeWhile(x => x < 5, stream): -1234
 * @param {Number} n
 * @param {Stream} stream stream from which to take
 * @returns {Stream} stream containing at most the first n items from this stream
 */
function take(n, stream) {
	var stepper = stream.step;
	return stream.beget(function(s) {
		if(s.value === 0) {
			return new End(s.time, s.value, s.state);
		}

		return when(function (i) {
			return i.done ? i
				: i.withState(new Yield(i.time, s.value - 1, i.state));
		}, when(stepper, s.state));
	}, new Yield(stream.scheduler.now(), n|0, stream.state));
}

/**
 * stream:                    -a-b-c-d-e-f-g
 * signal:                    -------x
 * takeUntil(signal, stream): -a-b-c-
 * @param {Stream} signal retain only events in stream before the first
 * event in signal
 * @param {Stream} stream events to retain
 * @returns {Stream} new stream containing only events that occur before
 * the first event in signal.
 */
function takeUntil(signal, stream) {
	return stream.begetWithDispose(stepTakeUntil,
		new TakeUntil(null, signal, stream, stream.state), disposeTakeUntil);
}

function stepTakeUntil(s) {
	if(s.until === null) {
		s = new TakeUntil(awaitSignal(s), s.signal, s.stream, s.state);
	}

	return unamb(function (i, index) {
		return handleTakeUntil(s, i, index);
	}, [s.until, when(s.stream.step, s.state)]);
}

function handleTakeUntil (s, i, index) {
	return index === 0 ? endTakeUntil(s, i)
		: i.withState(new TakeUntil(s.until, s.signal, s.stream, i.state));
}

function disposeTakeUntil(t, x, s) {
	return s.stream.dispose(t, x, s.state);
}

function awaitSignal(s) {
	return when(s.signal.step, s.signal.state);
}

function endTakeUntil(s, i) {
	return new End(i.time, i.value, new TakeUntil(null, null, s.stream, s.state));
}

function TakeUntil(until, signal, stream, state) {
	this.until = until; this.signal = signal; this.stream = stream; this.state = state;
}

/**
 * Remove adjacent duplicates, using === to detect duplicates
 * stream:           -abbcd-
 * distinct(stream): -ab-cd-
 * @param {Stream} stream stream from which to omit adjacent duplicates
 * @returns {Stream} stream with no adjacent duplicates
 */
function distinct(stream) {
	return distinctBy(same, stream);
}

/**
 * Remove adjacent duplicates using the provided equals function to detect duplicates
 * stream:           -abbcd-
 * distinct(stream): -ab-cd-
 * @param {?function(a:*, b:*):boolean} equals optional function to compare items.
 * @param {Stream} stream stream from which to omit adjacent duplicates
 * @returns {Stream} stream with no adjacent duplicates
 */
function distinctBy(equals, stream) {
	var stepper = stream.step;
	return stream.beget(function(s) {
		return stepDistinct(equals, stepper, s);
	}, new Pair(init, stream.state));
}

function stepDistinct(equals, stepper, s) {
	return when(function(i) {
		if(i.done) {
			return i;
		}

		// Always allow the first item, and all non-duplicates
		if(s.value === init || !equals(s.value, i.value)) {
			return yieldPair(i, i.value);
		}

		return stepDistinct(equals, stepper, new Pair(s.value, i.state));
	}, when(stepper, s.state));
}

function same(a, b) {
	return a === b;
}