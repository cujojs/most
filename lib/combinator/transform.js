/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var flatMap = require('./join').flatMap;

exports.map = map;
exports.ap  = ap;
exports.constant = constant;

function map(f, stream) {
	return new Stream(new Map(f, stream.source));
}

function ap(fs, xs) {
	return fs.flatMap(function(f) {
		return xs.map(f);
	});
}

function constant(x, stream) {
	return map(function() {
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

MapSink.prototype.event = function(t, x) {
	var f = this.f;
	this.sink.event(t, f(x));
};

MapSink.prototype.end = function(t, x) {
	this.sink.end(t, x);
};