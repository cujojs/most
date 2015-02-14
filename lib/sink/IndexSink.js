/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Sink = require('./Pipe');

module.exports = IndexSink;

IndexSink.hasValue = hasValue;
IndexSink.getValue = getValue;

function hasValue(indexSink) {
	return indexSink.hasValue;
}

function getValue(indexSink) {
	return indexSink.value;
}

function IndexSink(i, sink) {
	this.index = i;
	this.sink = sink;
	this.active = true;
	this.hasValue = false;
	this.value = void 0;
}

IndexSink.prototype.event = function(t, x) {
	if(!this.active) {
		return;
	}
	this.value = x;
	this.hasValue = true;
	this.sink.event(t, this);
};

IndexSink.prototype.end = function(t, x) {
	if(!this.active) {
		return;
	}
	this.active = false;
	this.sink.end(t, { index: this.index, value: x });
};

IndexSink.prototype.error = Sink.prototype.error;
