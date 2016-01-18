/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var ValueSource = require('./ValueSource');
var fromArray = require('./fromArray').fromArray;
var dispose = require('../disposable/dispose');
var PropagateTask = require('../scheduler/PropagateTask');
var base = require('../base');

exports.of = streamOf;
exports.empty = empty;
exports.never = never;

/**
 * Stream containing only x
 * @param {*} x
 * @returns {Stream}
 */
function streamOf(x/*, y, z, ... */) {
	return arguments.length === 0 ? EMPTY
		: arguments.length === 1 ? only(x)
		: fromArray(base.copy(arguments));
}

function only(x) {
	return new Stream(new ValueSource(emit, x));
}

function emit(t, x, sink) {
	sink.event(0, x);
	sink.end(0, void 0);
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
	var task = PropagateTask.end(void 0, sink);
	scheduler.asap(task);

	return dispose.newDisposable(disposeEmpty, task);
};

function disposeEmpty(task) {
	return task.dispose();
}

var EMPTY = new Stream(new EmptySource());

/**
 * Stream containing no events and never ends
 * @returns {Stream}
 */
function never() {
	return NEVER;
}

function NeverSource() {}

NeverSource.prototype.run = function() {
	return dispose.empty();
};

var NEVER = new Stream(new NeverSource());
