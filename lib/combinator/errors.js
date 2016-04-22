/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var ValueSource = require('../source/ValueSource');
var SafeSink = require('../sink/SafeSink');
var Pipe = require('../sink/Pipe');
var dispose = require('../disposable/dispose');
var tryEvent = require('../source/tryEvent');
var isPromise = require('../Promise').isPromise;

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
	this.sink = new SafeSink(sink);
	this.scheduler = scheduler;
	this.disposable = source.run(this, scheduler);
}

RecoverWithSink.prototype.event = function(t, x) {
		tryEvent.tryEvent(t, x, this.sink);
}

RecoverWithSink.prototype.end = function(t, x) {
		tryEvent.tryEnd(t, x, this.sink);
}

RecoverWithSink.prototype.error = function(t, e) {
	var nextSink = this.sink.disable();

	var result = dispose.tryDispose(t, this.disposable, nextSink);
	this.disposable = isPromise(result)
		? dispose.promised(this._thenContinue(result, e, nextSink))
		: this._continue(this.f, e, nextSink);
};

RecoverWithSink.prototype._thenContinue = function(p, x, sink) {
	var self = this;
	return p.then(function () {
		return self._continue(self.f, x, sink);
	});
};

RecoverWithSink.prototype._continue = function(f, x, sink) {
	return f(x).source.run(sink, this.scheduler);
};

RecoverWithSink.prototype.dispose = function() {
	return this.disposable.dispose();
};
