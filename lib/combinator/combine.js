/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var transform = require('./transform');
var core = require('../source/core');
var IndexSink = require('../sink/IndexSink');
var PropagateTask = require('../scheduler/PropagateTask');
var CompoundDisposable = require('../disposable/CompoundDisposable');
var base = require('../base');
var invoke = require('../invoke');

var hasValue = IndexSink.hasValue;
var getValue = IndexSink.getValue;

var map = base.map;
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
	return new Stream(new Combine(f, map(getSource, tail(arguments))));
}

/**
 * Combine latest events from all input streams
 * @param {function(...events):*} f function to combine most recent events
 * @param {[Stream]} streams most recent events
 * @returns {Stream} stream containing the result of applying f to the most recent
 *  event of each input stream, whenever a new event arrives on any stream.
 */
function combineArray(f, streams) {
	return streams.length === 0 ? core.empty()
		 : streams.length === 1 ? transform.map(f, streams[0])
		 : new Stream(new Combine(f, map(getSource, streams)));
}

function getSource(stream) {
	return stream.source;
}

function Combine(f, sources) {
	this.f = f;
	this.sources = sources;
}

Combine.prototype.run = function(sink, scheduler) {
	var l = this.sources.length;
	var disposables = new Array(l);
	var sinks = new Array(l);

	var combineSink = new CombineSink(this.f, sinks, scheduler, sink);

	for(var indexSink, i=0; i<l; ++i) {
		indexSink = sinks[i] = new IndexSink(i, combineSink);
		disposables[i] = this.sources[i].run(indexSink, scheduler);
	}

	return new CompoundDisposable(disposables);
};

function CombineSink(f, sinks, scheduler, sink) {
	this.f = f;
	this.sinks = sinks;
	this.scheduler = scheduler;
	this.sink = sink;
	this.active = false;
	this.activeCount = sinks.length;
	this.time = -Infinity;
}

CombineSink.prototype.event = function(t /*, indexSink */) {
	if(!this.active) {
		this.active = this.sinks.every(hasValue);
	}

	if(this.active && t > this.time) {
		this.time = t;
		this.task = this.scheduler.at(t, new CombineTask(this.f, this.sinks, this.sink), 1);
	}
};

CombineSink.prototype.end = function(t, indexedValue) {
	if(--this.activeCount === 0) {
		this.scheduler.at(t, PropagateTask.end(indexedValue.value, this.sink), 1);
	}
};

CombineSink.prototype.error = function(t, e) {
	this.scheduler.at(t, PropagateTask.error(e, this.sink), 1);
};

function CombineTask(f, sinks, sink) {
	this.f = f;
	this.sinks = sinks;
	this.sink = sink;
}

CombineTask.prototype.run = function(t) {
	this.sink.event(t, invoke(this.f, map(getValue, this.sinks)));
};

CombineTask.prototype.error = function(t, e) {
	this.sink.error(t, e);
};

CombineTask.prototype.dispose = base.noop;