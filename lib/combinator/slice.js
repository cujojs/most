/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var Sink = require('../sink/Pipe');
var AwaitingDisposable = require('../disposable/AwaitingDisposable');
var EmptyDisposable = require('../disposable/EmptyDisposable');

exports.take = take;
exports.skip = skip;
exports.slice = slice;
exports.takeWhile = takeWhile;
exports.skipWhile = skipWhile;

function take(n, stream) {
	return slice(0, n, stream);
}

function skip(n, stream) {
	return slice(n, Infinity, stream);
}

function slice(start, end, stream) {
	return new Stream(new Slice(start, end, stream.source));
}

function Slice(min, max, source) {
	this.skip = min;
	this.take = max - min;
	this.source = source;
}

Slice.prototype.run = function(sink) {
	if(this.take <= 0) {
		return new EmptyDisposable();
	}
	return new SliceSink(this.skip, this.take, this.source, sink);
};

function SliceSink(skip, take, source, sink) {
	this.skip = skip;
	this.take = take;
	this.sink = sink;
	this.disposable = source.run(this);
}

SliceSink.prototype.end   = Sink.prototype.end;
SliceSink.prototype.error = Sink.prototype.error;

SliceSink.prototype.event = function(t, x) {
	if(this.skip > 0) {
		this.skip -= 1;
		return;
	}

	if(this.take === 0) {
		return;
	}

	this.take -= 1;
	this.sink.event(t, x);
	if(this.take === 0) {
		this.dispose();
		this.sink.end(t, x);
	}
};

SliceSink.prototype.dispose = function() {
	var x = this.disposable.dispose();
	this.disposable = new AwaitingDisposable(x);
	return x;
};

function takeWhile(p, stream) {
	return new Stream(new TakeWhile(p, stream.source));
}

function TakeWhile(p, source) {
	this.p = p;
	this.source = source;
}

TakeWhile.prototype.run = function(sink) {
	return new TakeWhileSink(this.p, this.source, sink);
};

function TakeWhileSink(p, source, sink) {
	this.p = p;
	this.sink = sink;
	this.active = true;
	this.disposable = source.run(this);
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
	var x = this.disposable.dispose();
	this.disposable = new AwaitingDisposable(x);
	return x;
};

function skipWhile(p, stream) {
	return new Stream(new SkipWhile(p, stream.source));
}

function SkipWhile(p, source) {
	this.p = p;
	this.source = source;
}

SkipWhile.prototype.run = function(sink) {
	return this.source.run(new SkipWhileSink(this.p, sink));
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
