/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var defer = require('../defer');

module.exports = DeferredSink;

function DeferredSink(sink) {
	this.sink = sink;
	this.events = [];
	this.length = 0;
	this.active = true;
}

DeferredSink.prototype.event = function(t, x) {
	if(!this.active) {
		return;
	}

	if(this.length === 0) {
		defer(new PropagateAllTask(this));
	}

	this.events[this.length++] = { time: t, value: x };
};

DeferredSink.prototype.error = function(t, e) {
	this.active = false;
	defer(new ErrorTask(t, e, this.sink));
};

DeferredSink.prototype.end = function(t, x) {
	this.active = false;
	defer(new EndTask(t, x, this.sink));
};

function PropagateAllTask(deferred) {
	this.deferred = deferred;
}

PropagateAllTask.prototype.run = function() {
	var p = this.deferred;
	var events = p.events;
	var sink = p.sink;
	var event;

	for(var i = 0, l = p.length; i<l; ++i) {
		event = events[i];
		sink.event(event.time, event.value);
		events[i] = void 0;
	}

	p.length = 0;
};

PropagateAllTask.prototype.error = function(e) {
	this.deferred.error(0, e);
};

function EndTask(t, x, sink) {
	this.time = t;
	this.value = x;
	this.sink = sink;
}

EndTask.prototype.run = function() {
	this.sink.end(this.time, this.value);
};

EndTask.prototype.error = function(e) {
	this.sink.error(this.time, e);
};

function ErrorTask(t, e, sink) {
	this.time = t;
	this.value = e;
	this.sink = sink;
}

ErrorTask.prototype.run = function() {
	this.sink.error(this.time, this.value);
};

ErrorTask.prototype.error = function(e) {
	throw e;
};
