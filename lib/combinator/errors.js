/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var ValueSource = require('../source/ValueSource');

exports.flatMapError = flatMapError;
exports.throwError   = throwError;

function flatMapError(f, stream) {
	return new Stream(new FlatMapError(f, stream.source));
}

function throwError(e) {
	return new Stream(new ValueSource(error, e));
}

function error(producer) {
	producer.sink.error(0, producer.value);
}

function FlatMapError(f, source) {
	this.f = f;
	this.source = source;
}

FlatMapError.prototype.run = function(sink) {
	return new FlatMapErrorSink(this.f, this.source, sink);
};

function FlatMapErrorSink(f, source, sink) {
	this.f = f;
	this.sink = sink;
	this.active = true;
	this.disposable = source.run(this);
}

FlatMapErrorSink.prototype.error = function(t, e) {
	if(!this.active) {
		return;
	}

	// TODO: forward dispose errors
	this.disposable.dispose();
	//resolve(this.disposable.dispose()).catch(function(e) { sink.error(t, e); });

	var f = this.f;
	var stream = f(e);
	this.disposable = stream.source.run(this.sink);
};

FlatMapErrorSink.prototype.event = function(t, x) {
	if(!this.active) {
		return;
	}
	this.sink.event(t, x);
};

FlatMapErrorSink.prototype.end = function(t, x) {
	if(!this.active) {
		return;
	}
	this.sink.end(t, x);
};

FlatMapErrorSink.prototype.dispose = function() {
	this.active = false;
	return this.disposable.dispose();
};