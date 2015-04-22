/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var sink = require('../sink/sink');
var base = require('../base');
var PropagateTask = require('../scheduler/PropagateTask');
var scheduler = require('../scheduler/defaultScheduler');

var tryEvent = sink.tryEvent;
var tryEnd   = sink.tryEnd;
var tryError = sink.tryError;

module.exports = Publisher;

function Publisher() {
	this.sinks = [];
	this.sink = new PublisherSink(this);
	this.stream = new Stream(new PublisherSource(this));
	this.active = true;
	this._events = [];
	this._eventsLen = 0;
}

Publisher.prototype.event = function(x) {
	this._checkState();
	if(this._eventsLen === 0) {
		scheduler.asap(new PropagateAllTask(this));
	}
	this._events[this._eventsLen++] = x;
};

function PropagateAllTask(publisher) {
	this.publisher = publisher;
}

PropagateAllTask.prototype.run = function(t) {
	var p = this.publisher;
	var events = p._events;
	var sink = p.sink;
    for(var i = 0, l = p._eventsLen; i<l; ++i) {
		sink.event(t, events[i]);
		events[i] = void 0;
	}
	p._eventsLen = 0;
};

PropagateAllTask.prototype.error = function(e, sink) {
	this.publisher.sink.error(0, sink);
};

PropagateAllTask.prototype.dispose = function() {
	this.publisher.events = void 0;
};

Publisher.prototype.end = function(x) {
	this._checkState();
	this.active = false;
	scheduler.asap(PropagateTask.end(x, this.sink));
};

Publisher.prototype.error = function(e) {
	this._checkState();
	this.active = false;
	scheduler.asap(PropagateTask.error(e, this.sink));
};

Publisher.prototype._checkState = function() {
	if(!this.active) {
		throw new Error('stream ended');
	}
};

function PublisherSource(publisher) {
	this.publisher = publisher;
}

PublisherSource.prototype.run = function(sink, scheduler) {
	var rec = { sink: sink, scheduler: scheduler };
	this.publisher.sinks = base.append(rec, this.publisher.sinks);
	return new PublisherDisposable(rec, this.publisher);
};

function PublisherDisposable(target, publisher) {
	this.target = target;
	this.publisher = publisher;
}

PublisherDisposable.prototype.dispose = function() {
	this.publisher.sinks = remove(this.target, this.publisher.sinks);
};

function remove(x, a) {
	return base.remove(base.findIndex(x, a), a);
}

function PublisherSink(publisher) {
	this.publisher = publisher;
}

PublisherSink.prototype.event = function(t, x) {
	propagate(tryEvent, x, this.publisher.sinks);
};

PublisherSink.prototype.end = function(t, x) {
	propagate(tryEnd, x, this.publisher.sinks);
};

PublisherSink.prototype.error = function(t, e) {
	propagate(tryError, e, this.publisher.sinks);
};

function propagate(propagateOne, x, consumers) {
	for(var i= 0, consumer; i<consumers.length; ++i) {
		consumer = consumers[i];
		propagateOne(consumer.scheduler.now(), x, consumer.sink);
	}
}
