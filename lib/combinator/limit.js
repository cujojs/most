/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var CompoundDisposable = require('../disposable/CompoundDisposable');

exports.throttle = throttle;
exports.debounce = debounce;

function throttle(dt, stream) {
	return new Stream(new Throttle(dt, stream.source));
}

function Throttle(time, source) {
	this.dt = time;
	this.source = source;
}

Throttle.prototype.run = function(sink) {
	return this.source.run(new ThrottleSink(this.dt, sink));
};

function ThrottleSink(dt, sink) {
	this.time = 0;
	this.dt = dt;
	this.sink = sink;
}

ThrottleSink.prototype.event = function(t, x) {
	if(t > this.time) {
		this.time = t + this.dt;
		this.sink.event(t, x);
	}
};

ThrottleSink.prototype.end = function(t, x) {
	this.sink.end(t, x);
};

function debounce(dt, stream) {
	return new Stream(new Debounce(dt, stream.source));
}

function Debounce(dt, source) {
	this.dt = dt;
	this.source = source;
}

Debounce.prototype.run = function(sink) {
	return new DebounceSink(this.dt, this.source, sink);
};

function DebounceSink(dt, source, sink) {
	this.dt = dt;
	this.sink = sink;
	this.timer = null;

	var sourceDisposable = source.run(this);
	this.disposable = new CompoundDisposable([this, sourceDisposable]);
}

DebounceSink.prototype.event = function(t, x) {
	this._clearTimer();
	this.timer = setTimeout(this._emit, this.dt, t + this.dt, x, this);
};

DebounceSink.prototype.end = function(t, x) {
	this._clearTimer();
	this.sink.end(t, x);
};

DebounceSink.prototype.dispose = function() {
	this._clearTimer();
};

DebounceSink.prototype._clearTimer = function() {
	if(this.timer !== null) {
		clearTimeout(this.timer);
		this.timer = null;
	}
};

DebounceSink.prototype._emit = function(t, x, debounceSink) {
	debounceSink._clearTimer();
	debounceSink.sink.event(t, x);
};