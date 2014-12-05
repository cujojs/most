/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var Sink = require('../sink/Sink');
var CompoundDisposable = require('../disposable/CompoundDisposable');
var AwaitingDisposable = require('../disposable/AwaitingDisposable');
var noop = require('../base').noop;

exports.takeUntil = takeUntil;
exports.skipUntil = skipUntil;

function takeUntil(signal, stream) {
	return new Stream(new TakeUntil(signal.source, stream.source));
}

function TakeUntil(signalSource, source) {
	this.signal = signalSource;
	this.source = source;
}

TakeUntil.prototype.run = function(sink) {
	return new TakeUntilSink(this.signal, this.source, sink);
};

function TakeUntilSink(signal, source, sink) {
	this.sink = sink;

	var signalDisposable = signal.run(new EndSignal(this));
	var sourceDisposable = source.run(this);
	this.disposable = new CompoundDisposable([signalDisposable, sourceDisposable]);
}

TakeUntilSink.prototype.dispose = function() {
	var x = this.disposable.dispose();
	this.disposable = new AwaitingDisposable(x);
	return x;
};

TakeUntilSink.prototype.event = Sink.prototype.event;
TakeUntilSink.prototype.error = Sink.prototype.error;

TakeUntilSink.prototype.end = function(t, x) {
	this.dispose();
	this.sink.end(t, x);
};

function EndSignal(sink) {
	this.sink = sink;
}

EndSignal.prototype.end = noop;

EndSignal.prototype.event = function(t, x) {
	this.sink.end(t, x);
};

function skipUntil(signal, stream) {
	return new Stream(new SkipUntil(signal.source, stream.source));
}

function SkipUntil(signal, source) {
	this.signal = signal;
	this.source = source;
}

SkipUntil.prototype.run = function(sink) {
	var start = new StartSignal(this.signal, sink);
	var sourceDisposable = this.source.run(new AfterSink(start, sink));

	return new CompoundDisposable([start, sourceDisposable]);
};

function AfterSink(signal, sink) {
	this.signal = signal;
	this.sink = sink;
}

AfterSink.prototype.end   = Sink.prototype.end;
AfterSink.prototype.error = Sink.prototype.error;

AfterSink.prototype.event = function(t, x) {
	t >= this.signal.value && this.sink.event(t, x);
};

function StartSignal(signal, sink) {
	this.value = Infinity;
	this.sink = sink;
	this.disposable = signal.run(this);
}

StartSignal.prototype.end   = noop;
StartSignal.prototype.error = Sink.prototype.error;

StartSignal.prototype.event = function(t) {
	if(t >= this.value) {
		return;
	}

	this.value = t;
	this.dispose();
};

StartSignal.prototype.dispose = function() {
	var x = this.disposable.dispose();
	this.disposable = new AwaitingDisposable(x);
	return x;
};
