/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var Sink = require('../sink/Pipe');
var Filter = require('../fusion/Filter');

exports.filter = filter;
exports.distinct = distinct;
exports.distinctBy = distinctBy;

/**
 * Retain only items matching a predicate
 * @param {function(x:*):boolean} p filtering predicate called for each item
 * @param {Stream} stream stream to filter
 * @returns {Stream} stream containing only items for which predicate returns truthy
 */
function filter(p, stream) {
	return new Stream(Filter.create(p, stream.source));
}

/**
 * Remove adjacent duplicates, using === to detect duplicates
 * @param {Stream} stream stream from which to omit adjacent duplicates
 * @returns {Stream} stream with no adjacent duplicates
 */
function distinct(stream) {
	return distinctBy(same, stream);
}

/**
 * Remove adjacent duplicates using the provided equals function to detect duplicates
 * @param {?function(a:*, b:*):boolean} equals optional function to compare items.
 * @param {Stream} stream stream from which to omit adjacent duplicates
 * @returns {Stream} stream with no adjacent duplicates
 */
function distinctBy(equals, stream) {
	return new Stream(new Distinct(equals, stream.source));
}

function Distinct(equals, source) {
	this.equals = equals;
	this.source = source;
}

Distinct.prototype.run = function(sink, scheduler) {
	return this.source.run(new DistinctSink(this.equals, sink), scheduler);
};

function DistinctSink(equals, sink) {
	this.equals = equals;
	this.sink = sink;
	this.value = void 0;
	this.init = true;
}

DistinctSink.prototype.end   = Sink.prototype.end;
DistinctSink.prototype.error = Sink.prototype.error;

DistinctSink.prototype.event = function(t, x) {
	if(this.init) {
		this.init = false;
		this.value = x;
		this.sink.event(t, x);
	} else if(!this.equals(this.value, x)) {
		this.value = x;
		this.sink.event(t, x);
	}
};

function same(a, b) {
	return a === b;
}
