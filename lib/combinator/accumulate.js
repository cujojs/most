/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var Pipe = require('../sink/Pipe');
var runSource = require('../runSource');
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
	return new Stream(new Scan(f, initial, stream.source));
}

function Scan(f, z, source) {
	this.f = f;
	this.value = z;
	this.source = source;
}

Scan.prototype.run = function(sink, scheduler) {
	return this.source.run(new ScanSink(this.f, this.value, sink), scheduler);
};

function ScanSink(f, z, sink) {
	this.f = f;
	this.value = z;
	this.sink = sink;
	this.init = true;
}

ScanSink.prototype.event = function(t, x) {
	if(this.init) {
		this.init = false;
		this.sink.event(t, this.value);
	}

	var f = this.f;
	this.value = f(this.value, x);
	this.sink.event(t, this.value);
};

ScanSink.prototype.error = Pipe.prototype.error;
ScanSink.prototype.end = Pipe.prototype.end;

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
	return runSource.withDefaultScheduler(noop, new Accumulate(f, initial, stream.source));
}

function Accumulate(f, z, source) {
	this.f = f;
	this.value = z;
	this.source = source;
}

Accumulate.prototype.run = function(sink, scheduler) {
	return this.source.run(new AccumulateSink(this.f, this.value, sink), scheduler);
};

function AccumulateSink(f, z, sink) {
	this.f = f;
	this.value = z;
	this.sink = sink;
}

AccumulateSink.prototype.event = function(t, x) {
	var f = this.f;
	this.value = f(this.value, x);
	this.sink.event(t, this.value);
};

AccumulateSink.prototype.error = Pipe.prototype.error;

AccumulateSink.prototype.end = function(t) {
	this.sink.end(t, this.value);
};
