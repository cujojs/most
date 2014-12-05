/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var Sink = require('../sink/Sink');

exports.flatMapEnd = flatMapEnd;

function flatMapEnd(f, stream) {
	return new Stream(new FlatMapEnd(f, stream.source));
}

function FlatMapEnd(f, source) {
	this.f = f;
	this.source = source;
}

FlatMapEnd.prototype.run = function(sink) {
	return new FlatMapEndSink(this.f, this.source, sink);
};

function FlatMapEndSink(f, source, sink) {
	this.f = f;
	this.sink = sink;
	this.active = true;
	this.disposable = source.run(this);
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

	// TODO: forward dispose errors
	this.disposable.dispose();
	//resolve(this.disposable.dispose()).catch(function(e) { sink.error(t, e); });

	var f = this.f;
	var stream = f(x);
	this.disposable = stream.source.run(this.sink);
};

FlatMapEndSink.prototype.dispose = function() {
	this.active = false;
	return this.disposable.dispose();
};