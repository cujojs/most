/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var Sink = require('../sink/Sink');
var IndexSink = require('../sink/IndexSink');
var CompoundDisposable = require('../disposable/CompoundDisposable');
var base = require('../base');

var map = base.map;
var tail = base.tail;

exports.zip = zip;
exports.zipArray = zipArray;

function zip(f /*,...streams */) {
	return zipArray(f, tail(arguments));
}

function zipArray(f, streams) {
	return new Stream(new Zip(f, map(getSource, streams)))
}

function getSource(stream) {
	return stream.source;
}

function Zip(f, sources) {
	this.f = f;
	this.sources = sources;
}

Zip.prototype.run = function(sink) {
	var l = this.sources.length;
	var disposables = new Array(l);
	var sinks = new Array(l);
	var buffers = new Array(l);

	var zipSink = new ZipSink(this.f, buffers, sinks, sink);

	for(var indexSink, i=0; i<l; ++i) {
		buffers[i] = [];
		indexSink = sinks[i] = new IndexSink(i, zipSink);
		disposables[i] = this.sources[i].run(indexSink);
	}

	return new CompoundDisposable(disposables);
};

function ZipSink(f, buffers, sinks, sink) {
	this.f = f;
	this.sinks = sinks;
	this.sink = sink;
	this.buffers = buffers;
}

ZipSink.prototype.event = function(t, indexedValue) {
	var buffers = this.buffers;
	var buffer = buffers[indexedValue.index];

	buffer.push(indexedValue.value);

	if(buffer.length === 1) {
		if(!this.buffers.every(hasValue)) {
			return;
		}

		emitZipped(this.f, t, buffers, this.sink);
		this._checkEnd(t);
	}
};

ZipSink.prototype._checkEnd = function(t) {
	var ended = this.buffers.some(this._checkBuffer, this);
	if (ended) {
		this.sink.end(t, void 0);
	}
};

ZipSink.prototype._checkBuffer = function(buf, i) {
	return buf.length === 0 && !this.sinks[i].active;
};

ZipSink.prototype.end = function(t, indexedValue) {
	var buffer = this.buffers[indexedValue.index];
	if(buffer.length === 0) {
		this.sink.end(t, indexedValue.value);
	}
};

ZipSink.prototype.error = Sink.prototype.error;

function emitZipped (f, t, buffers, sink) {
	var x = f.apply(void 0, map(head, buffers));
	sink.event(t, x);
}

function hasValue(buffer) {
	return buffer.length > 0;
}

function head(buffer) {
	return buffer.shift();
}
