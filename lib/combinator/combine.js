/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var transform = require('./transform');
var core = require('../source/core');
var Pipe = require('../sink/Pipe');
var IndexSink = require('../sink/IndexSink');
var mergeSources = require('./merge').mergeSources;
var dispose = require('../disposable/dispose');
var base = require('../base');
var invoke = require('../invoke');

var hasValue = IndexSink.hasValue;

//var map = base.map;
var tail = base.tail;

exports.combineArray = combineArray;
exports.combine = combine;

/**
 * Combine latest events from all input streams
 * @param {function(...events):*} f function to combine most recent events
 * @returns {Stream} stream containing the result of applying f to the most recent
 *  event of each input stream, whenever a new event arrives on any stream.
 */
function combine(f /*, ...streams */) {
	return combineArray(f, tail(arguments));
}

/**
 * Combine latest events from all input streams
 * @param {function(...events):*} f function to combine most recent events
 * @param {[Stream]} streams most recent events
 * @returns {Stream} stream containing the result of applying f to the most recent
 *  event of each input stream, whenever a new event arrives on any stream.
 */
function combineArray(f, streams) {
	var l = streams.length;
	return l === 0 ? core.empty()
		 : l === 1 ? transform.map(f, streams[0])
		 : new Stream(mergeSources(CombineSink, f, streams));
}

function CombineSink(disposables, sinks, sink, f) {
	this.sink = sink;
	this.disposables = disposables;
	this.sinks = sinks;
	this.f = f;
	this.values = new Array(sinks.length);
	this.ready = false;
	this.activeCount = sinks.length;
}

CombineSink.prototype.error = Pipe.prototype.error;

CombineSink.prototype.event = function(t, indexedValue) {
	if(!this.ready) {
		this.ready = this.sinks.every(hasValue);
	}

	this.values[indexedValue.index] = indexedValue.value;
	if(this.ready) {
		this.sink.event(t, invoke(this.f, this.values));
	}
};

CombineSink.prototype.end = function(t, indexedValue) {
	dispose.tryDispose(t, this.disposables[indexedValue.index], this.sink);
	if(--this.activeCount === 0) {
		this.sink.end(t, indexedValue.value);
	}
};
