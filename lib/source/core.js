/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var ValueSource = require('../source/ValueSource');
var EmptyDisposable = require('../disposable/EmptyDisposable');
var scheduler = require('../Scheduler');

exports.of = streamOf;
exports.empty = empty;
exports.never = never;

function streamOf(x) {
	return new Stream(new ValueSource(emit, x));
}

function emit(producer) {
	if(!producer.active) {
		return;
	}
	producer.sink.event(0, producer.value);
	producer.sink.end(0, void 0);
}

function empty() {
	return new Stream(new EmptySource());
}

function EmptySource() {}

EmptySource.prototype.run = function(sink) {
	scheduler.asap(end, error, sink);
	return new EmptyDisposable();
};

function end(sink) {
	return sink.end(0);
}

function error(e) {
	var sink = this._x;
	sink.error(0, e);
}

function never() {
	return new Stream(new NeverSource());
}

function NeverSource() {}

NeverSource.prototype.run = function() {
	return new EmptyDisposable();
};
