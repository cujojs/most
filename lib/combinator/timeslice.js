/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var CompoundDisposable = require('../disposable/CompoundDisposable');
var core = require('../source/core');
var join = require('../combinator/flatMap').join;
var take = require('../combinator/slice').take;
var noop = require('../base').noop;

var streamOf = core.of;
var never = core.never;

exports.during    = during;
exports.takeUntil = takeUntil;
exports.skipUntil = skipUntil;

function takeUntil(signal, stream) {
	return between(streamOf(), signal, stream);
}

function skipUntil(signal, stream) {
	return between(signal, never(), stream);
}

function during(timeWindow, stream) {
	return between(timeWindow, join(timeWindow), stream);
}

function between(start, end, stream) {
	return new Stream(new Within(take(1, start).source, take(1, end).source, stream.source));
}

function Within(minSignal, maxSignal, source) {
	this.minSignal = minSignal;
	this.maxSignal = maxSignal;
	this.source = source;
}

Within.prototype.run = function(sink, scheduler) {
	var min = new Bound(noop, this.minSignal, sink, scheduler);
	var max = new Bound(propagateEnd, this.maxSignal, sink, scheduler);
	var disposable = this.source.run(new WithinSink(min, max, sink), scheduler);

	return new CompoundDisposable([min, max, disposable]);
};

function WithinSink(min, max, sink) {
	this.min = min;
	this.max = max;
	this.sink = sink;
}

WithinSink.prototype.event = function(t, x) {
	if(t < this.min.value) {
		return;
	}

	if(t >= this.max.value) {
		this.sink.end(t, x);
	} else {
		this.sink.event(t, x);
	}
};

WithinSink.prototype.error = function(t, e) {
	if(t >= this.min.value && t < this.max.value) {
		this.sink.error(t, e);
	}
};

WithinSink.prototype.end = function(t, x) {
	if(t >= this.min.value && t < this.max.value) {
		this.sink.end(t, x);
	}
};

function Bound(handleEvent, signal, sink, scheduler) {
	this.handleEvent = handleEvent;
	this.value = Infinity;
	this.sink = sink;
	this.disposable = signal.run(this, scheduler);
}

Bound.prototype.event = function(t, x) {
	if(t < this.value) {
		this.value = t;
		this.handleEvent(this.sink, t, x);
	}
};

Bound.prototype.end = function(t, x) {
	if(t < this.value) {
		this.value = t;
		this.sink.end(t, x);
	}
};

Bound.prototype.error = function(t, e) {
	this.value = t;
	this.sink.error(t, e);
};

Bound.prototype.dispose = function() {
	return this.disposable.dispose();
};

function propagateEnd(sink, t, x) {
	sink.end(t, x);
}
