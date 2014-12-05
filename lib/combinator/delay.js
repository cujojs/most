/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var Sink = require('../sink/Sink');
var scheduler = require('../Scheduler');

exports.delay = delay;

function delay(dt, stream) {
	return new Stream(new Delay(dt, stream.source));
}

function Delay(dt, source) {
	this.dt = dt;
	this.source = source;
}

Delay.prototype.run = function(sink) {
	return this.source.run(new DelaySink(this.dt, sink));
};

function DelaySink(dt, sink) {
	this.dt = dt;
	this.sink = sink;
}

DelaySink.prototype.event = function(t, x) {
	scheduler.delay(this.dt, emit, error, x, this.sink);
};

function emit(x, sink, t) {
	sink.event(t, x);
}

DelaySink.prototype.end = function(t, x) {
	scheduler.delay(this.dt, end, error, x, this.sink);
};

function end(x, sink, t) {
	sink.end(t, x);
}

DelaySink.prototype.error = Sink.prototype.error;

function error(e, task, scheduler) {
	scheduler.cancel(task);
	var sink = task._y;
	sink.error(task.time, e);
}