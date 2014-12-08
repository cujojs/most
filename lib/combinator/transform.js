/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var flatMap = require('./join').flatMap;
var Sink = require('../sink/Sink');

exports.map = map;
exports.ap  = ap;
exports.constant = constant;
exports.tap = tap;

function map(f, stream) {
	return new Stream(new Map(f, stream.source));
}

function ap(fs, xs) {
	return flatMap(function(f) {
		return map(f, xs);
	}, fs);
}

function constant(x, stream) {
	return map(function() {
		return x;
	}, stream);
}

function tap(f, stream) {
	return map(function(x) {
		f(x);
		return x;
	}, stream);
}

function Map(f, source) {
	this.f = f;
	this.source = source;
}

Map.prototype.run = function(sink) {
	return this.source.run(new MapSink(this.f, sink));
};

function MapSink(f, sink) {
	this.f = f;
	this.sink = sink;
}

MapSink.prototype.end   = Sink.prototype.end;
MapSink.prototype.error = Sink.prototype.error;

MapSink.prototype.event = function(t, x) {
	var f = this.f;
	this.sink.event(t, f(x));
};
