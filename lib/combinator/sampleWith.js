/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var Pipe = require('../sink/Pipe');
var CompoundDisposable = require('../disposable/CompoundDisposable');
var noop = require('../base').noop;

exports.sampleWith = sampleWith;

/**
 * When an event arrives on sampler, emit the latest event value from stream.
 * @param {Stream} sampler stream of events at whose arrival time
 *  signal's latest value will be propagated
 * @param {Stream} signal stream of values
 * @returns {Stream} sampled stream of values
 */
function sampleWith(sampler, signal) {
	return new Stream(new Sample(sampler.source, signal.source));
}

/**
 * Samples value of signal at each event time in events
 * @param {Source} sampler stream of events at whose arrival time
 *  signal's latest value will be propagated
 * @param {Stream} signal stream of values
 * @constructor
 */
function Sample(sampler, signal) {
	this.sampler = sampler;
	this.source = signal;
}

Sample.prototype.run = function(sink, scheduler) {
	var hold = new Hold(this.source);
	var trigger = new Trigger(hold, sink);
	var d = [this.source.run(hold, scheduler), this.sampler.run(trigger, scheduler)];
	
	return new CompoundDisposable(d);
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