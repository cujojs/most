/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var Pipe = require('../sink/Pipe');
var CompoundDisposable = require('../disposable/CompoundDisposable');
var noop = require('../base').noop;

exports.sample = sample;

/**
 * Samples value of signal at each event time in events
 * @param {Stream} trigger stream of events at whose arrival time
 *  signal's latest value will be propagated
 * @param {Stream} signal stream whose latest value
 */
function sample(trigger, signal) {
	return new Stream(new Sample(trigger.source, signal.source));
}

/**
 * Samples value of signal at each event time in events
 * @param {Source} trigger stream of events at whose arrival time
 *  signal's latest value will be propagated
 * @param {Source} signal stream whose latest value
 * @constructor
 */
function Sample(trigger, signal) {
	this.events = trigger;
	this.source = signal;
}

Sample.prototype.run = function(sink) {
	var hold = new Hold(this.source);
	var trigger = new Trigger(hold, sink);
	return new CompoundDisposable([this.source.run(hold), this.events.run(trigger)]);
};

/**
 * Sink that remembers the latest event value from another sink
 * @constructor
 */
function Hold(sink) {
	this.hasValue = false;
	this.sink = sink;
}

Hold.prototype.event = function(t, x) {
	this.value = x;
	this.hasValue = true;
};

Hold.prototype.end = noop;
Hold.prototype.error = Pipe.prototype.error;

/**
 * Sink which, when it receives an event, propagates a signal's value to another sink
 * @constructor
 */
function Trigger(signal, sink) {
	this.signal = signal;
	this.sink = sink;
}

Trigger.prototype.event = function(t /*, x*/) {
	if(!this.signal.hasValue) {
		return;
	}
	this.sink.event(t, this.signal.value);
};

Trigger.prototype.end = Pipe.prototype.end;
Trigger.prototype.error = Pipe.prototype.error;