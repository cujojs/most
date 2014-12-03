/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
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
	var signalDisposable = this.signal.run(new EndOnlySink(sink));
	var sourceDisposable = this.source.run(sink);

	return new CompoundDisposable([signalDisposable, sourceDisposable]);
};

function EndOnlySink(sink) {
	this.sink = sink;
}

EndOnlySink.prototype.event = noop;

EndOnlySink.prototype.end = function(t, x) {
	// TODO: Dispose source and signal
	this.sink.end(t, x);
};

EndOnlySink.prototype.dispose = function() {
	var x = this.disposable.dispose();
	this.disposable = new AwaitingDisposable(x);
	return x;
};

function skipUntil(signal, stream) {
	return new Stream(new SkipUntil(signal.source, stream.source));
}

function SkipUntil(signalSource, source) {
	this.signalSource = signalSource;
	this.source = source;
}

SkipUntil.prototype.run = function(sink) {
	var signal = new StartSignal(this.signalSource);
	var sourceDisposable = this.source.run(new AfterSink(signal, sink));

	return new CompoundDisposable([signal, sourceDisposable]);
};

function AfterSink(signal, sink) {
	this.signal = signal;
	this.sink = sink;
}

AfterSink.prototype.event = function(t, x) {
	t >= this.signal.value && this.sink.event(t, x);
};

AfterSink.prototype.end = function(t, x) {
	this.sink.end(t, x);
};

function StartSignal(signalSource) {
	this.value = Infinity;
	this.disposable = signalSource.run(this);
}

StartSignal.prototype.event = function(t, x) {
	if(t < this.value) {
		this.value = t;
		this.disposable = new AwaitingDisposable(this.disposable.dispose());
	}
};

StartSignal.prototype.end = noop;

StartSignal.prototype.dispose = function() {
	return this.disposable.dispose();
};

