/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var MulticastSource = require('./MulticastSource');
var base = require('../base');

exports.fromEvent = fromEvent;
exports.fromEventWhere = fromEventWhere;

function fromEvent(event, source) {
	return fromEventWhere(always, event, source);
}

function fromEventWhere(predicate, event, source) {
	return new Stream(new MulticastSource(new EventSource(predicate, event, source)));
}

function EventSource(where, event, source) {
	this.where = where;
	this.event = event;
	this.source = source;
}

EventSource.prototype.run = function(sink, scheduler) {
	return new EventSink(this.where, this.event, this.source, sink, scheduler);
};

function EventSink(where, event, source, sink, scheduler) {
	this.event = event;
	this.source = source;
	this.sink = sink;
	this.where = where;

	var self = this;
	function addEvent(ev) {
		if(self.where(ev) === false) {
			return;
		}
		tryEvent(scheduler.now(), ev, self.sink);
	}

	this._addEvent = this._init(addEvent, event, source);
}

EventSink.prototype._init = function(addEvent, event, source) {
	var doAddEvent = addEvent;

	if(typeof source.addEventListener === 'function') {
		source.addEventListener(event, doAddEvent, false);

	} else if(typeof source.addListener === 'function') {
		// EventEmitter supports varargs (eg: emitter.emit('event', a, b, c, ...)) so
		// have to support it here by turning into an array
		doAddEvent = function addVarargs(a) {
			return arguments.length > 1 ? addEvent(base.copy(arguments)) : addEvent(a);
		};

		source.addListener(event, doAddEvent);

	} else {
		throw new Error('source must support addEventListener or addListener');
	}

	return doAddEvent;
};

EventSink.prototype.dispose = function() {
	if(typeof this.source.removeEventListener === 'function') {
		this.source.removeEventListener(this.event, this._addEvent, false);

	} else if(typeof this.source.removeListener === 'function') {
		this.source.removeListener(this.event, this._addEvent);

	} else {
		throw new Error('source must support removeEventListener or removeListener');
	}
};

function always() {
	return true;
}

function tryEvent (t, ev, sink) {
	try {
		sink.event(t, ev);
	} catch(e) {
		sink.error(t, e);
	}
}