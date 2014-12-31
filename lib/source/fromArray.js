/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var PropagateTask = require('../scheduler/PropagateTask');

exports.fromArray = fromArray;

function fromArray (a) {
	return new Stream(new ArraySource(a));
}

function ArraySource(a) {
	this.array = a;
}

ArraySource.prototype.run = function(sink, scheduler) {
	return new ArrayProducer(this.array, sink, scheduler);
};

function ArrayProducer(array, sink, scheduler) {
	this.scheduler = scheduler;
	this.task = new PropagateTask(runProducer, array, sink);
	scheduler.asap(this.task);
}

ArrayProducer.prototype.dispose = function() {
	return this.task.dispose();
};

function runProducer(t, array, sink) {
	for(var i=0, l=array.length; i<l && this.active; ++i) {
		sink.event(0, array[i]);
	}

	this.active && sink.end(0);
}
