/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var Sink = require('../sink/Sink');
var CompoundDisposable = require('../disposable/CompoundDisposable');
var scheduler = require('../Scheduler');

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

ThrottleSink.prototype.end   = Sink.prototype.end;
ThrottleSink.prototype.error = Sink.prototype.error;

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
	this.timer = scheduler.delay(this.dt, emit, error, x, this);
};

DebounceSink.prototype.end = function(t, x) {
	this._clearTimer();
	this.sink.end(t, x);
};

DebounceSink.prototype.error = function(t, x) {
	this._clearTimer();
	this.sink.error(t, x);
};

DebounceSink.prototype.dispose = function() {
	this._clearTimer();
};

DebounceSink.prototype._clearTimer = function() {
	if(this.timer !== null) {
		this.timer.cancel();
		this.timer = null;
	}
};

function emit(x, debounceSink, t) {
	debounceSink.sink.event(t, x);
}

function error(e, task) {
	task.cancel();
	var sink = task._y.sink;
	sink.error(task.time, e);
}