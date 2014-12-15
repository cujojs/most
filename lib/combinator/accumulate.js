/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var Sink = require('../sink/Pipe');
var cons = require('./build').cons;
var drain = require('./observe').drain;
var noop = require('../base').noop;

exports.scan = scan;
exports.reduce = reduce;

/**
 * Create a stream containing successive reduce results of applying f to
 * the previous reduce result and the current stream item.
 * @param {function(result:*, x:*):*} f reducer function
 * @param {*} initial initial value
 * @param {Stream} stream stream to scan
 * @returns {Stream} new stream containing successive reduce results
 */
function scan(f, initial, stream) {
	return cons(initial, new Stream(new Scan(f, initial, stream.source)));
}

/**
 * Reduce a stream to produce a single result.  Note that reducing an infinite
 * stream will return a Promise that never fulfills, but that may reject if an error
 * occurs.
 * @param {function(result:*, x:*):*} f reducer function
 * @param {*} initial initial value
 * @param {Stream} stream to reduce
 * @returns {Promise} promise for the file result of the reduce
 */
function reduce(f, initial, stream) {
	return drain(new Stream(new Scan(f, initial, stream.source)));
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