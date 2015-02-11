/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var PropagateTask = require('../scheduler/PropagateTask');
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
	this._start();
}

Reader.prototype._start = function() {
	var readable = this.readable;
	var sink = this.sink;
	var scheduler = this.scheduler;
	var self = this;

	this.active = true;
	readable.on('error', onError);
	readable.on('end', onEnd);
	readable.on('data', onReadable);

	function onError(e) {
		console.log('error');
		self._dispose();
		return sink.error(scheduler.now(), e);
	}

	function onEnd(x) {
		console.log('end');
		self._dispose();
		return sink.end(scheduler.now(), x);
	}

	function onReadable(buf) {
		//var buf = readable.read();
		var result = sink.event(scheduler.now(), buf);
		if(isPromise(result)) {
			if(!self.active) {
				return;
			}
			console.log('pausing');
			if(!readable.isPaused()) {
				readable.pause();
			}
			result.then(function() {
				console.log('resuming');
				if(!self.active) {
					return;
				}
				if(readable.isPaused()) {
					readable.resume();
				}
			}).catch(function(e) {
				return onError(e);
			});
		}
	}
};

Reader.prototype.dispose = function() {
	return this._dispose();
};

Reader.prototype._dispose = function() {
	if(this.active) {
		this.active = false;
		this.readable.pause();
	}
};

function isPromise(x) {
	return x !== null && typeof x === 'object' && typeof x.then === 'function'
}