/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var ValueSource = require('../source/ValueSource');

exports.flatMapError = flatMapError;
exports.throwError   = throwError;

/**
 * If stream encounters an error, recover and continue with items from stream
 * returned by f.
 * @param {function(error:*):Stream} f function which returns a new stream
 * @param {Stream} stream
 * @returns {Stream} new stream which will recover from an error by calling f
 */
function flatMapError(f, stream) {
	return new Stream(new FlatMapError(f, stream.source));
}

/**
 * Create a stream containing only an error
 * @param {*} e error value, preferably an Error or Error subtype
 * @returns {Stream} new stream containing only an error
 */
function throwError(e) {
	return new Stream(new ValueSource(error, e));
}

function error(t, e, sink) {
	sink.error(t, e);
}

function FlatMapError(f, source) {
	this.f = f;
	this.source = source;
}

FlatMapError.prototype.run = function(sink, scheduler) {
	return new FlatMapErrorSink(this.f, this.source, sink, scheduler);
};

function FlatMapErrorSink(f, source, sink, scheduler) {
	this.f = f;
	this.sink = sink;
	this.scheduler = scheduler;
	this.active = true;
	this.disposable = source.run(this, scheduler);
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
	this.disposable = stream.source.run(this.sink, this.scheduler);
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