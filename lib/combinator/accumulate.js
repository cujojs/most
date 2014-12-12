/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var Sink = require('../sink/Sink');
var cons = require('./build').cons;
var drain = require('./observe').drain;
var noop = require('../base').noop;

exports.scan = scan;
exports.reduce = reduce;

function scan(f, z, stream) {
	return cons(z, new Stream(new Scan(f, z, stream.source)));
}

function reduce(f, z, stream) {
	return drain(new Stream(new Scan(f, z, stream.source)));
}

function Scan(f, z, source) {
	this.f = f;
	this.value = z;
	this.source = source;
}

Scan.prototype.run = function(sink) {
	return this.source.run(new ScanSink(this.f, this.value, sink));
};

function ScanSink(f, z, sink) {
	this.f = f;
	this.value = z;
	this.sink = sink;
}

ScanSink.prototype.error = Sink.prototype.error;

ScanSink.prototype.event = function(t, x) {
	var f = this.f;
	this.value = f(this.value, x);
	this.sink.event(t, this.value);
};

ScanSink.prototype.end = function(t) {
	this.sink.end(t, this.value);
};

function EndValue(end, error) {
	this._end = end;
	this._error = error;
}

EndValue.prototype.event = noop;

EndValue.prototype.end = function(t, x) {
	this._end(x);
};

EndValue.prototype.error = function(t, e) {
	this._error(e);
};