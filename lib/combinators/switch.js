/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Stream = require('../Stream');
var promise = require('../promises');
var step = require('../step');

var raceIndex = promise.raceIndex;
var when = promise.when;

var Yield = step.Yield;

exports.switch = switchLatest;

/**
 * Given a stream of streams, return a new stream that adopts the behavior
 * of the most recent inner stream.
 * @param {Stream} stream of streams on which to switch
 * @returns {Stream} switching stream
 */
function switchLatest(stream) {
	return new Stream(stepSwitch, initState(stream));
}

function stepSwitch(s) {
	return switchNext(s.current === void 0 ? updateBoth(s.outer, s.inner) : s);
}

function switchNext(s) {
	return raceIndex(function(i, index) {
		return doSwitchNext(s, i, index);
	}, s.current);
}

function doSwitchNext(s, i, index) {
	/*jshint maxcomplexity:7*/
	var never = Stream.never();
	// If we got an item from the outer stream, we need to step it to get
	// the new inner stream, then start racing again.
	if(index === 0) {
		// If outer is done, consume current inner until it's done too.
		if(i.done) {
			return s.inner === never ? i
				: switchNext(updateOuter(never, s));
		}
		// Outer not done, step outer to get next inner stream
		return awaitNextOuter(s.outer, i);
	}

	if(i.done) {
		// If inner and outer are done, signal done, otherwise await the
		// next inner stream
		return s.outer === never ? i
			: stepBoth(s.outer, s.current[0]);
	}

	// Inner not done, yield latest value
	return new Yield(i.value, updateInner(new Stream(s.inner.step, i.state), s));
}

function initState(outer) {
	return { outer: outer, inner: Stream.never(), current: void 0 };
}

function updateBoth(outer, inner) {
	return { outer: outer, inner: inner, current: [streamNext(outer), streamNext(inner)] };
}

function updateOuter(outer, s) {
	return { outer: outer, inner: s.inner, current: [streamNext(outer), s.current[1]] };
}

function updateInner(inner, s) {
	return { outer: s.outer, inner: inner, current: [s.current[0], streamNext(inner)] };
}

function awaitNextOuter(outer, i) {
	return switchNext(updateBoth(new Stream(outer.step, i.state), i.value));
}

function stepBoth(outer, i) {
	return when(function(oi) {
		return awaitNextOuter(outer, oi);
	}, i);
}

function streamNext(s) {
	return when(s.step, s.state);
}
