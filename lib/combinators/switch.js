/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Stream = require('../Stream');
var promise = require('../promises');
var unamb = require('../step').unamb;

var when = promise.when;

exports.switch = switchLatest;

/**
 * Given a stream of streams, return a new stream that adopts the behavior
 * of the most recent inner stream.
 * @param {Stream} stream of streams on which to switch
 * @returns {Stream} switching stream
 */
function switchLatest(stream) {
	return stream.begetWithDispose(stepSwitch, initState(stream), disposeInner);
}

function stepSwitch(s) {
	return switchNext(s.current === null ? updateBoth(s.outer, s.inner) : s);
}

function switchNext(s) {
	return unamb(function(i, index) {
		return doSwitchNext(i, index, s);
	}, s.current);
}

function doSwitchNext(i, index, s) {
	/*jshint maxcomplexity:7*/
	var never = Stream.never();
	// If we got an item from the outer stream, we need to step it to get
	// the new inner stream, then start racing again.
	if(index === 0) {
		// If outer is done, consume current inner until it's done too.
		if(i.done) {
			return s.inner === never ? i.withState(s)
				: switchNext(updateOuter(never, s));
		}

		// Outer not done, step outer to get next inner stream
		// Signal lost interest in current inner
		return when(function() {
			return awaitNextOuter(s.outer, i);
		}, s.inner.dispose(i.time, i.value, s.inner.state));
	}

	if(i.done) {
		// If inner and outer are done, signal done, otherwise await the
		// next inner stream
		return s.outer === never ? i.withState(s)
			: stepBoth(s.outer, s.current[0]);
	}

	// Inner not done, yield latest value
	return i.withState(updateInner(s.inner.beget(s.inner.step, i.state), s));
}

function initState(outer) {
	return { outer: outer, inner: Stream.never(), current: null };
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

function end(outer, endStep) {
	return { outer: outer, inner: Stream.never(), current: [endStep, endStep] };
}

function awaitNextOuter(outer, i) {
	var next = i.done ? end(outer, i)
		: updateBoth(outer.beget(outer.step, i.state), i.value);

	return switchNext(next);
}

function stepBoth(outer, i) {
	return when(function(oi) {
		return awaitNextOuter(outer, oi);
	}, i);
}

function streamNext(s) {
	return when(s.step, s.state);
}

function disposeInner(t, x, s) {
	return s.inner.dispose(t, x, s.inner.state);
}
