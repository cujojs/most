/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var ValueSource = require('../source/ValueSource');
var EmptyDisposable = require('../disposable/EmptyDisposable');

exports.of = streamOf;
exports.empty = empty;
exports.never = never;

/**
 * Stream containing only x
 * @param {*} x
 * @returns {Stream}
 */
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

/**
 * Stream containing no events and ends immediately
 * @returns {Stream}
 */
function empty() {
	return EMPTY;
}

function EmptySource() {}

EmptySource.prototype.run = function(sink, scheduler) {
	scheduler.asap(end, error, sink);
	return new EmptyDisposable();
};

var EMPTY = new Stream(new EmptySource());

function end(sink) {
	return sink.end(0);
}

function error(e) {
	var sink = this._x;
	sink.error(0, e);
}

/**
 * Stream containing no events and never ends
 * @returns {Stream}
 */
function never() {
	return NEVER;
}

function NeverSource() {}

NeverSource.prototype.run = function() {
	return new EmptyDisposable();
};

var NEVER = new Stream(new NeverSource());
