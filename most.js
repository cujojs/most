/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var identity = require('./lib/fn').identity;

/**
 * Core event stream type
 * @type {Stream}
 */
var Stream = require('./lib/Stream');

exports.empty       = Stream.empty;
exports.of          = Stream.of;
exports.from        = Stream.from;
exports.fromPromise = Stream.fromPromise;

//-----------------------------------------------------------------------
// Building

var build = require('./lib/combinators/build');
var repeat = build.repeat;

exports.unfold  = build.unfold;
exports.iterate = build.iterate;
exports.repeat  = repeat;

/**
 * Tie this stream into a circle, thus creating an infinite stream
 * @returns {Stream} infinite stream that replays all items from this stream
 */
Stream.prototype.cycle = function() {
	return repeat(this).flatMap(identity);
};

//-----------------------------------------------------------------------
// Timers

var timed = require('./lib/combinators/timed');
var delay = timed.delay;
var delayOn = timed.delayOn;
var debounce = timed.debounce;
var debounceOn = timed.debounceOn;

exports.periodic   = timed.periodic;
exports.periodicOn = timed.periodicOn;
exports.delay      = delay;
exports.delayOn    = delayOn;
exports.debounce   = debounce;
exports.debounceOn = debounceOn;

/**
 * @param {Number} delayTime milliseconds to delay each item
 * @param {Scheduler=} scheduler optional scheduler to use
 * @returns {Stream} new stream containing the same items, but delayed by ms
 */
Stream.prototype.delay = function(delayTime, scheduler) {
	return arguments.length > 1 ? delayOn(scheduler, delayTime, this)
		: delay(delayTime, this);
};

/**
 * Skip events for period time after the most recent event
 * @param {Number} period time to suppress events
 * @param {Scheduler=} scheduler optional scheduler
 * @returns {Stream} new stream that skips events for debounce period
 */
Stream.prototype.debounce = function(period, scheduler) {
	return arguments.length > 1 ? debounceOn(scheduler, period, this)
		: debounce(period, this);
};

//-----------------------------------------------------------------------
// Zipping

var zip = require('./lib/combinators/zip');
var zipArray = zip.zipArray;
var zipArrayWith = zip.zipArrayWith;

exports.zip          = zip.zip;
exports.zipWith      = zip.zipWith;
exports.zipArray     = zipArray;
exports.zipArrayWith = zipArrayWith;

/**
 * Pair-wise combine items with those in s. Given 2 streams:
 * [1,2,3] zip [4,5,6] -> [[1,4],[2,5],[3,6]]
 * @returns {Stream} new stream containing pairs
 */
Stream.prototype.zip = function(/*,...ss*/) {
	return zipArray(cons(this, arguments));
};

/**
 * Pair-wise combine items with those in s. Given 2 streams:
 * [1,2,3] zipWith f [4,5,6] -> [f(1,4),f(2,5),f(3,6)]
 * @param {function(a:Stream, b:Stream, ...):*} f function to combine items
 * @returns {Stream} new stream containing pairs
 */
Stream.prototype.zipWith = function(f /*,...ss*/) {
	return zipArrayWith(f, cons(this, arguments));
};

//-----------------------------------------------------------------------
// Filtering

var distinct = require('./lib/combinators/distinct');
var distinctSame = distinct.distinct;
var distinctBy = distinct.distinctBy;

exports.distinct   = distinctSame;
exports.distinctBy = distinctBy;

/**
 * Remove adjacent duplicates: [a,b,b,c,b] -> [a,b,c,b]
 * @param {?function(a:*, b:*):boolean} equals optional function to compare items.
 * @returns {Stream} stream with no adjacent duplicates
 */
Stream.prototype.distinct = function(equals) {
	return arguments.length === 0 ? distinctSame(this) : distinctBy(equals, this);
};

//-----------------------------------------------------------------------
// Merging

var merge = require('./lib/combinators/merge');
var mergeArray = merge.mergeArray;
var mergeAll = merge.mergeAll;

exports.merge      = merge.merge;
exports.mergeArray = mergeArray;
exports.mergeAll   = mergeAll;

/**
 * Merge this stream and all the provided streams
 * @returns {Stream} stream containing items from this stream and s in time
 * order.  If two events are simultaneous they will be merged in
 * arbitrary order.
 */
Stream.prototype.merge = function(/*,...ss*/) {
	return mergeArray(cons(this, arguments));
};

/**
 * Assumes this is a stream of streams, and merges all items into a single stream.
 * @returns {Stream} stream containing items from all streams.
 */
Stream.prototype.mergeAll = function() {
	return mergeAll(this);
};

//-----------------------------------------------------------------------
// Helpers

function cons(x, array) {
	var l = array.length;
	var a = new Array(l + 1);
	a[0] = x;
	for(var i=0; i<l; ++i) {
		a[i + 1] = array[i];
	}
	return a;
}