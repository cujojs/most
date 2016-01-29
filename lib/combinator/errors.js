/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var ValueSource = require('../source/ValueSource');
var tryDispose = require('../disposable/dispose').tryDispose;
var tryEvent = require('../source/tryEvent');
var apply = require('../base').apply;

exports.flatMapError = recoverWith;
exports.recoverWith  = recoverWith;
exports.throwError   = throwError;

/**
 * If stream encounters an error, recover and continue with items from stream
 * returned by f.
 * @param {function(error:*):Stream} f function which returns a new stream
 * @param {Stream} stream
 * @returns {Stream} new stream which will recover from an error by calling f
 */
function recoverWith(f, stream) {
	return new Stream(new RecoverWith(f, stream.source));
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

function RecoverWith(f, source) {
	this.f = f;
	this.source = source;
}

RecoverWith.prototype.run = function(sink, scheduler) {
	return new RecoverWithSink(this.f, this.source, sink, scheduler);
};

function RecoverWithSink(f, source, sink, scheduler) {
	this.f = f;
	this.sink = sink;
	this.scheduler = scheduler;
	this.active = true;
	this.disposable = source.run(this, scheduler);
}

RecoverWithSink.prototype.error = function(t, e) {
	if(!this.active) {
		return;
	}

	// TODO: forward dispose errors
	tryDispose(t, this.disposable, this);

	var stream = apply(this.f, e);
	this.disposable = stream.source.run(this.sink, this.scheduler);
};

RecoverWithSink.prototype.event = function(t, x) {
	if(!this.active) {
		return;
	}
	tryEvent.tryEvent(t, x, this.sink);
};

RecoverWithSink.prototype.end = function(t, x) {
	if(!this.active) {
		return;
	}
	tryEvent.tryEnd(t, x, this.sink);
};

RecoverWithSink.prototype.dispose = function() {
	this.active = false;
	return this.disposable.dispose();
};
