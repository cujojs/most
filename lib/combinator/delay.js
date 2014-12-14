/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var Sink = require('../sink/Pipe');
var CompoundDisposable = require('../disposable/CompoundDisposable');
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
	var delaySink = new DelaySink(this.dt, sink);
	return new CompoundDisposable([delaySink, this.source.run(delaySink)]);
};

function DelaySink(dt, sink) {
	this.dt = dt;
	this.sink = sink;
}

DelaySink.prototype.dispose = function() {
	var self = this;
	scheduler.cancelAll(function(task) {
		return task._y === self;
	});
};

DelaySink.prototype.event = function(t, x) {
	scheduler.delay(this.dt, emit, error, x, this);
};

function emit(x, delay, t) {
	delay.sink.event(t, x);
}

DelaySink.prototype.end = function(t, x) {
	scheduler.delay(this.dt, end, error, x, this);
};

function end(x, delay, t) {
	delay.sink.end(t, x);
}

DelaySink.prototype.error = Sink.prototype.error;

function error(e, task) {
	task.cancel();
	var sink = task._y.sink;
	sink.error(task.time, e);
}