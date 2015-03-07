/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var MulticastSource = require('./MulticastSource');

exports.fromReadableStream = fromReadableStream;

function fromReadableStream(s) {
	return new Stream(new MulticastSource(new ReadableStreamSource(s)));
}

function ReadableStreamSource(s) {
	this.readable = s;
}

ReadableStreamSource.prototype.run = function(sink, scheduler) {
	return new Reader(this.readable, sink, scheduler);
};

function Reader(readable, sink, scheduler) {
	this.readable = readable;
	this.sink = sink;
	this.scheduler = scheduler;
	this.active = false;

	var self = this;
	this._onError = function(e) {
		return self._error(e);
	};

	this._onEnd = function(x) {
		return self._end(x);
	};

	this._onData = function(x) {
		return self._event(x);
	};

	this._resume = function() {
		self.readable.resume();
	};

	this._start();
}

Reader.prototype.dispose = function() {
	this.active = false;
	this.readable.removeListener('data', this._onData);
	this.readable.removeListener('end', this._onEnd);
	this.readable.removeListener('error', this._onError);
};

Reader.prototype._start = function() {
	this.active = true;
	this.readable.on('error', this._onError);
	this.readable.on('end', this._onEnd);
	this.readable.on('data', this._onData);
};

Reader.prototype._event = function(x) {
	if(!this.active) {
		return;
	}

	var result = this.sink.event(this.scheduler.now(), x);

	if(isPromise(result)) {
		this.readable.pause();
		return result.then(this._resume).catch(this._onError);
	}
};

Reader.prototype._end = function(x) {
	this.active = false;
	return this.sink.end(this.scheduler.now(), x);
};

Reader.prototype._error = function(e) {
	this.active = false;
	return this.sink.error(this.scheduler.now(), e);
};

function isPromise(x) {
	return x !== null && typeof x === 'object' && typeof x.then === 'function'
}