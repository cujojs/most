/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var Sink = require('../sink/Pipe');
var AwaitingDisposable = require('../disposable/AwaitingDisposable');
var CompoundDisposable = require('../disposable/CompoundDisposable');

exports.flatMapEnd = flatMapEnd;

function flatMapEnd(f, stream) {
	return new Stream(new FlatMapEnd(f, stream.source));
}

function FlatMapEnd(f, source) {
	this.f = f;
	this.source = source;
}

FlatMapEnd.prototype.run = function(sink, scheduler) {
	return new FlatMapEndSink(this.f, this.source, sink, scheduler);
};

function FlatMapEndSink(f, source, sink, scheduler) {
	this.f = f;
	this.sink = sink;
	this.scheduler = scheduler;
	this.active = true;
	this.disposable = new AwaitingDisposable(source.run(this, scheduler));
}

FlatMapEndSink.prototype.error = Sink.prototype.error;

FlatMapEndSink.prototype.event = function(t, x) {
	if(!this.active) {
		return;
	}
	this.sink.event(t, x);
};

FlatMapEndSink.prototype.end = function(t, x) {
	if(!this.active) {
		return;
	}

	this.dispose();

	var f = this.f;
	var stream = f(x);
	var disposable = stream.source.run(this.sink, this.scheduler);
	this.disposable = new CompoundDisposable([this.disposable, disposable]);
};

FlatMapEndSink.prototype.dispose = function() {
	this.active = false;
	return this.disposable.dispose();
};