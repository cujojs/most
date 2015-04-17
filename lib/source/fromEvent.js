/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var MulticastSource = require('./MulticastSource');
var PropagateTask = require('../scheduler/PropagateTask');
var base = require('../base');

exports.fromEvent = fromEvent;

/**
 * Create a stream from an EventTarget, such as a DOM Node, or EventEmitter.
 * @param {String} event event type name, e.g. 'click'
 * @param {EventTarget|EventEmitter} source EventTarget or EventEmitter
 * @returns {Stream} stream containing all events of the specified type
 * from the source.
 */
function fromEvent(event, source) {
	var s;
	if(typeof source.addEventListener === 'function') {
		s = new MulticastSource(new EventSource(event, source));
	} else if(typeof source.addListener === 'function') {
		s = new EventEmitterSource(event, source);
	} else {
		throw new Error('source must support addEventListener or addListener');
	}

	return new Stream(s);
}

function EventSource(event, source) {
	this.event = event;
	this.source = source;
}

EventSource.prototype.run = function(sink, scheduler) {
	return new EventAdapter(this.event, this.source, sink, scheduler);
};

function EventAdapter(event, source, sink, scheduler) {
	this.event = event;
	this.source = source;
	this.sink = sink;

	var self = this;
	function addEvent(ev) {
		tryEvent(scheduler.now(), ev, self.sink);
	}

	this._addEvent = this._init(addEvent, event, source);
}

EventAdapter.prototype._init = function(addEvent, event, source) {
	source.addEventListener(event, addEvent, false);
	return addEvent;
};

EventAdapter.prototype.dispose = function() {
	if (typeof this.source.removeEventListener !== 'function') {
		throw new Error('source must support removeEventListener or removeListener');
	}

	this.source.removeEventListener(this.event, this._addEvent, false);
};

function EventEmitterSource(event, source) {
	this.event = event;
	this.source = source;
}

EventEmitterSource.prototype.run = function(sink, scheduler) {
	return new EventEmitterAdapter(this.event, this.source, sink, scheduler);
};

function EventEmitterAdapter(event, source, sink, scheduler) {
	this.event = event;
	this.source = source;
	this.sink = sink;

	var self = this;
	function addEvent(ev) {
		// NOTE: Because EventEmitter allows events in the same call stack as
		// a listener is added, use the scheduler to buffer all events
		// until the stack clears, then propagate.
		scheduler.asap(new PropagateTask(tryEvent, ev, self.sink));
	}

	this._addEvent = this._init(addEvent, event, source);
}

EventEmitterAdapter.prototype._init = function(addEvent, event, source) {
	var doAddEvent = addEvent;

	// EventEmitter supports varargs (eg: emitter.emit('event', a, b, c, ...)) so
	// have to support it here by turning into an array
	doAddEvent = function addVarargs(a) {
		return arguments.length > 1 ? addEvent(base.copy(arguments)) : addEvent(a);
	};

	source.addListener(event, doAddEvent);

	return doAddEvent;
};

EventEmitterAdapter.prototype.dispose = function() {
	if (typeof this.source.removeListener !== 'function') {
		throw new Error('source must support removeEventListener or removeListener');
	}

	this.source.removeListener(this.event, this._addEvent);
};

function tryEvent (t, x, sink) {
	try {
		sink.event(t, x);
	} catch(e) {
		sink.error(t, e);
	}
}