/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var MulticastSource = require('./MulticastSource');
var DeferredSink = require('../sink/DeferredSink');

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
	if(typeof source.addEventListener === 'function' && typeof source.removeEventListener === 'function') {
		s = new MulticastSource(new EventTargetSource(event, source));
	} else if(typeof source.addListener === 'function' && typeof source.removeListener === 'function') {
		s = new EventEmitterSource(event, source);
	} else {
		throw new Error('source must support addEventListener/removeEventListener or addListener/removeListener');
	}

	return new Stream(s);
}

function EventTargetSource(event, source) {
	this.event = event;
	this.source = source;
}

EventTargetSource.prototype.run = function(sink, scheduler) {
	return new EventAdapter(initEventTarget, this.event, this.source, sink, scheduler);
};

function initEventTarget(addEvent, event, source) {
	source.addEventListener(event, addEvent, false);
	return function(event, target) {
		target.removeEventListener(event, addEvent, false);
	};
}

function EventEmitterSource(event, source) {
	this.event = event;
	this.source = source;
}

EventEmitterSource.prototype.run = function(sink, scheduler) {
	// NOTE: Because EventEmitter allows events in the same call stack as
	// a listener is added, use a DeferredSink to buffer events
	// until the stack clears, then propagate.  This maintains most.js's
	// invariant that no event will be delivered in the same call stack
	// as an observer begins observing.
	return new EventAdapter(initEventEmitter, this.event, this.source, new DeferredSink(sink), scheduler);
};

function initEventEmitter(addEvent, event, source) {
	// EventEmitter supports varargs (eg: emitter.emit('event', a, b, c, ...)) so
	// have to support it here by turning into an array
	function addEventVariadic(a) {
		var l = arguments.length;
		if(l > 1) {
			var arr = new Array(l);
			for(var i=0; i<l; ++i) {
				arr[i] = arguments[i];
			}
			addEvent(arr);
		} else {
			addEvent(a);
		}
	}

	source.addListener(event, addEventVariadic);

	return function(event, target) {
		target.removeListener(event, addEventVariadic);
	};
}

function EventAdapter(init, event, source, sink, scheduler) {
	this.event = event;
	this.source = source;

	function addEvent(ev) {
		tryEvent(scheduler.now(), ev, sink);
	}

	this._dispose = init(addEvent, event, source);
}

EventAdapter.prototype.dispose = function() {
	return this._dispose(this.event, this.source);
};

function tryEvent (t, x, sink) {
	try {
		sink.event(t, x);
	} catch(e) {
		sink.error(t, e);
	}
}