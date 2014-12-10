/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var Sink = require('../sink/Sink');
var CompoundDisposable = require('../disposable/CompoundDisposable');
var core = require('../source/core');
var noop = require('../base').noop;

streamOf = core.of;
never = core.never;

exports.timeslice = timeslice;
exports.takeUntil = takeUntil;
exports.skipUntil = skipUntil;

function timeslice(start, end, stream) {
	return new Stream(new Timeslice(start.source, end.source, stream.source));
}

function takeUntil(signal, stream) {
	return timeslice(streamOf(), signal, stream);
}

function skipUntil(signal, stream) {
	return timeslice(signal, never(), stream);
}

function Timeslice(minSignal, maxSignal, source) {
	this.minSignal = minSignal;
	this.maxSignal = maxSignal;
	this.source = source;
}

Timeslice.prototype.run = function(sink) {
	var min = new TimeSignal(sink);
	var minDisposable = this.minSignal.run(min);

	var max = new TimeSignal(sink);
	var maxDisposable = this.maxSignal.run(max);

	var disposable = this.source.run(new TimesliceSink(min, max, sink));

	return new CompoundDisposable([minDisposable, maxDisposable, disposable]);
};

function TimesliceSink(min, max, sink) {
	this.min = min;
	this.max = max;
	this.sink = sink;
}

TimesliceSink.prototype.event = function(t, x) {
	if(t < this.min.value) {
		return;
	}

	if(t >= this.max.value) {
		this.sink.end(t, x);
	} else {
		this.sink.event(t, x);
	}
};

TimesliceSink.prototype.error = function(t, e) {
	if(t >= this.min.value && t < this.max.value) {
		this.sink.error(t, e);
	}
};

TimesliceSink.prototype.end = function(t, x) {
	if(t >= this.min.value && t < this.max.value) {
		this.sink.end(t, x);
	}
};

function TimeSignal(sink) {
	this.value = Infinity;
	this.sink = sink;
}

TimeSignal.prototype.event = function(t /*, x */) {
	if(t < this.value) {
		this.value = t;
	}
};

TimeSignal.prototype.end = function(t, x) {
	if(t < this.value) {
		this.value = t;
		this.sink.end(t, x);
	}
};

TimeSignal.prototype.error = function(t, e) {
	this.value = t;
	this.sink.error(t, e);
};
