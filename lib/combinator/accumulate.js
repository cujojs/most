/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var SafeSink = require('../sink/SafeSink');
var EndValueSink = require('../sink/EndValueSink');
var Promise = require('../Promise');
var cons = require('./build').cons;

var resolve = Promise.resolve;

exports.scan = scan;
exports.reduce = reduce;

function scan(f, z, stream) {
	return cons(z, new Stream(new Scan(f, z, stream.source)));
}

function reduce(f, z, stream) {
	var source = new Scan(f, z, stream.source);
	var disposable;

	return new Promise(function(res, rej) {
		var end = new EndValueSink(function (x) {
			resolve(disposable.dispose()).then(function () {
				res(x);
			}, rej);
		});

		disposable = source.run(new SafeSink(end));
	});
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

ScanSink.prototype.event = function(t, x) {
	this.value = this.f(this.value, x);
	this.sink.event(t, this.value);
};

ScanSink.prototype.end = function(t, x) {
	this.sink.end(t, this.value);
};

