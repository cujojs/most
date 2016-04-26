/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var Sink = require('../sink/Pipe');
var core = require('../source/core');
var dispose = require('../disposable/dispose');

exports.take = take;
exports.skip = skip;
exports.slice = slice;
exports.takeWhile = takeWhile;
exports.skipWhile = skipWhile;

/**
 * @param {number} n
 * @param {Stream} stream
 * @returns {Stream} new stream containing only up to the first n items from stream
 */
function take(n, stream) {
	return slice(0, n, stream);
}

/**
 * @param {number} n
 * @param {Stream} stream
 * @returns {Stream} new stream with the first n items removed
 */
function skip(n, stream) {
	return slice(n, Infinity, stream);
}

/**
 * Slice a stream by index. Negative start/end indexes are not supported
 * @param {number} start
 * @param {number} end
 * @param {Stream} stream
 * @returns {Stream} stream containing items where start <= index < end
 */
function slice(start, end, stream) {
	return end <= start ? core.empty()
		: new Stream(sliceSource(start, end, stream.source));
}

function sliceSource(start, end, source) {
	if(source instanceof Slice) {
		start += source.min;
		end = Math.min(end - source.min, source.max);
		return new Slice(start, end, source.source);
	}
	return new Slice(start, end, source);
}

function Slice(min, max, source) {
	this.min = min;
	this.max = max;
	this.source = source;
}

Slice.prototype.run = function(sink, scheduler) {
	return new SliceSink(this.min, this.max, this.source, sink, scheduler);
};

function SliceSink(min, max, source, sink, scheduler) {
	this.min = min;
	this.max = max-1;
	this.index = 0;
	this.sink = sink;
	this.disposable = dispose.once(source.run(this, scheduler));
}

SliceSink.prototype.end   = Sink.prototype.end;
SliceSink.prototype.error = Sink.prototype.error;

SliceSink.prototype.event = function(t, x) {
	var index = this.index;
	this.index++;

	if(index < this.min || index > this.max) {
		return;
	}

	this.sink.event(t, x);
	if(index === this.max) {
		this.dispose();
		this.sink.end(t, x);
	}
};

SliceSink.prototype.dispose = function() {
	return this.disposable.dispose();
};

function takeWhile(p, stream) {
	return new Stream(new TakeWhile(p, stream.source));
}

function TakeWhile(p, source) {
	this.p = p;
	this.source = source;
}

TakeWhile.prototype.run = function(sink, scheduler) {
	return new TakeWhileSink(this.p, this.source, sink, scheduler);
};

function TakeWhileSink(p, source, sink, scheduler) {
	this.p = p;
	this.sink = sink;
	this.active = true;
	this.disposable = dispose.once(source.run(this, scheduler));
}

TakeWhileSink.prototype.end   = Sink.prototype.end;
TakeWhileSink.prototype.error = Sink.prototype.error;

TakeWhileSink.prototype.event = function(t, x) {
	if(!this.active) {
		return;
	}

	var p = this.p;
	this.active = p(x);
	if(this.active) {
		this.sink.event(t, x);
	} else {
		this.dispose();
		this.sink.end(t, x);
	}
};

TakeWhileSink.prototype.dispose = function() {
	return this.disposable.dispose();
};

function skipWhile(p, stream) {
	return new Stream(new SkipWhile(p, stream.source));
}

function SkipWhile(p, source) {
	this.p = p;
	this.source = source;
}

SkipWhile.prototype.run = function(sink, scheduler) {
	return this.source.run(new SkipWhileSink(this.p, sink), scheduler);
};

function SkipWhileSink(p, sink) {
	this.p = p;
	this.sink = sink;
	this.skipping = true;
}

SkipWhileSink.prototype.end   = Sink.prototype.end;
SkipWhileSink.prototype.error = Sink.prototype.error;

SkipWhileSink.prototype.event = function(t, x) {
	if(this.skipping) {
		var p = this.p;
		this.skipping = p(x);
		if(this.skipping) {
			return;
		}
	}

	this.sink.event(t, x);
};
