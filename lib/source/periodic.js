/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var Disposable = require('../disposable/Disposable');
var MulticastSource = require('./MulticastSource');
var scheduler = require('../Scheduler');

exports.periodic = periodic;

function periodic(period) {
	return new Stream(new MulticastSource(new Periodic(period)));
}

function Periodic(period) {
	this.period = period;
}

Periodic.prototype.run = function(sink) {
	var task = scheduler.periodic(this.period, emit, error, sink);
	return new Disposable(cancelTask, task);
};

function cancelTask(task) {
	task.cancel();
}

function emit(sink, _, t) {
	sink.event(t, t);
}

function error(e, task) {
	task.cancel();
	var sink = task._x;
	sink.error(task.time, e);
}