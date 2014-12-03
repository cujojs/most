/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');

exports.filter = filter;
exports.distinct = distinct;
exports.distinctBy = distinctBy;

function filter(p, stream) {
	return new Stream(new Filter(p, stream.source));
}

function distinct(stream) {
	return distinctBy(same, stream);
}

function distinctBy(equals, stream) {
	return new Stream(new Distinct(equals, stream.source));
}

function Filter(p, source) {
	this.p = p;
	this.source = source;
}

Filter.prototype.run = function(sink) {
	return this.source.run(new FilterSink(this.p, sink));
};

function FilterSink(p, sink) {
	this.p = p;
	this.sink = sink;
}

FilterSink.prototype.event = function(t, x) {
	var p = this.p;
	p(x) && this.sink.event(t, x);
};

FilterSink.prototype.end = function(t, x) {
	this.sink.end(t, x);
};

function Distinct(equals, source) {
	this.equals = equals;
	this.source = source;
}

Distinct.prototype.run = function(sink) {
	return this.source.run(new DistinctSink(this.equals, sink));
};

var unique = {};
function DistinctSink(equals, sink) {
	this.equals = equals;
	this.sink = sink;
	this.value = unique;
}

DistinctSink.prototype.event = function(t, x) {
	if(this.value === unique || !this.equals(this.value, x)) {
		this.value = x;
		this.sink.event(t, x);
	}
};

DistinctSink.prototype.end = function(t, x) {
	this.sink.end(t, x);
};

function same(a, b) {
	return a === b;
}