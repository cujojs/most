/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var promise = require('../promises');
var unamb = require('../step').unamb;
var base = require('../base');

var tail = base.tail;
var replace = base.replace;
var append = base.append;
var map = base.map;

var neverP = promise.never();
var when = promise.when;
var all = promise.Promise.all;

exports.join = join;

/**
 * Monadic join. Flatten a Stream<Stream<X>> to Stream<X> by merging inner
 * streams to the outer.  Event arrival times are preserved.
 * @param {Stream<Stream>} stream stream of streams
 * @returns {Stream}
 */
function join(stream) {
	return stream.begetWithDispose(stepJoin, [{ stream: stream, i: null }], disposeInners);
}

function stepJoin(s) {
	var s0 = s[0];
	return stepEarliest(s0.i === null ? [stepPair(s0.stream)] : s);
}

function stepEarliest(s) {
	return unamb(function(i, index) {
		return handleStep(i, index, s);
	}, map(getIteration, s));
}

function handleStep(i, index, s) {
	return index === 0 ? stepOuter(i, s) : stepInner(i, index, s);
}

function stepOuter(i, s) {
	if(i.done) {
		return s.length === 1 ? i.withState(s) : stepJoin(replace(endOuter(i, s[0].stream), 0, s));
	}

	return stepJoin(append(stepPair(i.value), stepAtIndex(i, 0, s)));
}

function stepInner(i, index, s) {
	if(i.done) {
		var sp = without(i, index, s);
		if(sp.length === 1 && sp[0].i === neverP) {
			return when(function(s) {
				return i.withState(s);
			}, sp);
		}

		return when(stepJoin, sp);
	}

	return i.withState(stepAtIndex(i, index, s));
}

function stepAtIndex(i, index, s) {
	var stream = s[index].stream;
	return replace(stepPair(stream.beget(stream.step, i.state)), index, s);
}

function stepPair(stream) {
	return { stream: stream, i: when(stream.step, stream.state) };
}

function endOuter(i, stream) {
	return { stream: stream, i: disposeOuter(i, stream) };
}

function getIteration(s) {
	return s.i;
}

function without(step, index, arr) {
	var stream = arr[index].stream;
	return when(function() {
		return arr.filter(function(x, ai) {
			return index !== ai;
		});
	}, stream.dispose(step.time, step.value, step.state));
}

function disposeOuter (i, stream) {
	return when(function () {
		return neverP;
	}, stream.dispose(i.time, i.value, i.state));
}

function disposeInners(t, x, s) {
	return all(map(function(si) {
		return disposeInner(t, x, si);
	}, tail(s))); // s[0] is the outer stream, ignore it
}

function disposeInner (t, x, si) {
	return when(function (i) {
		return si.stream.dispose(t, x, i.state);
	}, si.i);
}
