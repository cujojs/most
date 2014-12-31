/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var Disposable = require('../disposable/Disposable');
var MulticastSource = require('./MulticastSource');
var PropagateTask = require('../scheduler/PropagateTask');

exports.periodic = periodic;

/**
 * Create a stream that emits the current time periodically
 * @param {Number} period
 * @returns {Stream} new stream that emits the current time every period
 */
function periodic(period) {
	return new Stream(new MulticastSource(new Periodic(period)));
}

function Periodic(period) {
	this.period = period;
}

Periodic.prototype.run = function(sink, scheduler) {
	var task = scheduler.periodic(this.period, new PropagateTask(emit, void 0, sink));
	return new Disposable(cancelTask, task);
};

function cancelTask(task) {
	task.cancel();
}

function emit(t, x, sink) {
	sink.event(t, t);
}
