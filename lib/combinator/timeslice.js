/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var CompoundDisposable = require('../disposable/CompoundDisposable');
var AwaitingDisposable = require('../disposable/AwaitingDisposable');
var core = require('../source/core');
var noop = require('../base').noop;

var streamOf = core.of;
var never = core.never;

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
	var min = new TimeSignal(noop, this.minSignal, sink);
	var max = new TimeSignal(propagateEnd, this.maxSignal, sink);
	var disposable = this.source.run(new TimesliceSink(min, max, sink));

	return new CompoundDisposable([min, max, disposable]);
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

function TimeSignal(handleEvent, signal, sink) {
	this.handleEvent = handleEvent;
	this.value = Infinity;
	this.sink = sink;
	this.disposable = signal.run(this);
}

TimeSignal.prototype.event = function(t, x) {
	if(t < this.value) {
		this.dispose();
		this.value = t;
		this.handleEvent(this.sink, t, x);
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

TimeSignal.prototype.dispose = function() {
	var x = this.disposable.dispose();
	this.disposable = new AwaitingDisposable(x);
	return x;
};

function propagateEnd(sink, t, x) {
	sink.end(t, x);
}