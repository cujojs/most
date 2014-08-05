/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var base = require('./lib/base');
var identity = base.identity;
var cons = base.cons;

/**
 * Core event stream type
 * @type {Stream}
 */
var Stream = require('./lib/Stream');
exports.Stream      = Stream;

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
exports.cons = exports.startsWith = consStream;

/**
 * Tie this stream into a circle, thus creating an infinite stream
 * @returns {Stream} infinite stream that replays all items from this stream
 */
Stream.prototype.cycle = function() {
	return repeat(this).flatMap(identity);
};

/**
 * @param {*} x
 * @param {Stream} stream
 * @returns {Stream} new stream containing x followed by all items in this stream
 */
function consStream(x, stream) {
	return concat(Stream.of(x), stream);
}

/**
 * @param {*} x item to prepend
 * @returns {Stream} a new stream with x prepended
 */
Stream.prototype.cons = Stream.prototype.startWith = function(x) {
	return consStream(x, this);
};

//-----------------------------------------------------------------------
// Creating
// EXPERIMENTAL: API may change

var create = require('./lib/combinators/create');

/**
 * Create a stream by calling producer with functions for adding items to
 * the stream and for ending the stream.
 * @param {function(add:function(x:*), end:function(error?:Error))} producer
 * @returns {Stream}
 */
exports.create = create.create;

//-----------------------------------------------------------------------
// Transforming

var transform = require('./lib/combinators/transform');

var map = transform.map;
var ap = transform.ap;
var flatMap = transform.flatMap;
var scan = transform.scan;
var tap = transform.tap;

exports.map     = map;
exports.ap      = ap;
exports.flatMap = flatMap;
exports.flatten = flatten;
exports.scan = scan;
exports.tap = tap;

/**
 * Transform each value in the stream by applying f to each
 * @param {function(*):*} f mapping function
 * @returns {Stream} stream containing items transformed by f
 */
Stream.prototype.map = function(f) {
	return map(f, this);
};

/**
 * Assume this stream contains functions, and apply each function to each item
 * in the provided stream.  This generates, in effect, a cross product.
 * @param {Stream} xs stream of items to which
 * @returns {Stream} stream containing the cross product of items
 */
Stream.prototype.ap = function(xs) {
	return ap(this, xs);
};

/**
 * Map each value in the stream to a new stream, and emit its values
 * into the returned stream.
 * @param {function(x:*):Stream} f chaining function, must return a Stream
 * @returns {Stream} new stream containing all items from each stream returned by f
 */
Stream.prototype.flatMap = Stream.prototype.chain = function(f) {
	return flatMap(f, this);
};

/**
 * Flatten a stream of stream of x into a stream of x
 * @returns {Stream} stream of x
 */
Stream.prototype.flatten = function() {
	return flatMap(identity, this);
};

/**
 * Flatten a stream of stream of x into a stream of x
 * @param {Stream} stream stream of stream of x
 * @returns {Stream} stream of x
 */
function flatten(stream) {
	return flatMap(identity, stream);
}

/**
 * Create a stream containing successive reduce results of applying f to
 * the previous reduce result and the current stream item.
 * @param {function(result:*, x:*):*} f reducer function
 * @param {*} initial initial value
 * @returns {Stream} new stream containing successive reduce results
 */
Stream.prototype.scan = function(f, initial) {
	return scan(f, initial, this);
};

/**
 * Perform a side effect for each item in the stream
 * @param {function(x:*):*} f side effect to execute for each item. The
 *  return value will be discarded.
 * @returns {Stream} new stream containing the same items as this stream
 */
Stream.prototype.tap = function(f) {
	return tap(f, this);
};

//-----------------------------------------------------------------------
// Filtering

var filter = require('./lib/combinators/filter');
var filterStream = filter.filter;
var take = filter.take;
var takeWhile = filter.takeWhile;
var distinctSame = filter.distinct;
var distinctBy = filter.distinctBy;

exports.filter     = filterStream;
exports.take       = take;
exports.takeWhile  = takeWhile;
exports.distinct   = distinctSame;
exports.distinctBy = distinctBy;

/**
 * Retain only items matching a predicate
 * @param {function(x:*):boolean} p filtering predicate called for each item
 * @returns {Stream} stream containing only items for which predicate returns truthy
 */
Stream.prototype.filter = function(p) {
	return filterStream(p, this);
};

/**
 * @param {Number} n
 * @returns {Stream} stream containing at most the first n items from this stream
 */
Stream.prototype.take = function(n) {
	return take(n, this);
};

/**
 * @param {function(x:*):boolean} p
 * @returns {Stream} stream containing items up to, but not including, the
 * first item for which p returns falsy.
 */
Stream.prototype.takeWhile = function(p) {
	return takeWhile(p, this);
};

/**
 * Remove adjacent duplicates: [a,b,b,c,b] -> [a,b,c,b]
 * @param {?function(a:*, b:*):boolean} equals optional function to compare items.
 * @returns {Stream} stream with no adjacent duplicates
 */
Stream.prototype.distinct = function(equals) {
	return arguments.length === 0 ? distinctSame(this) : distinctBy(equals, this);
};

//-----------------------------------------------------------------------
// Reducing

var reducing = require('./lib/combinators/reduce');
var reduce = reducing.reduce;
var reduce1 = reducing.reduce1;

exports.reduce  = reduce;
exports.reduce1 = reduce1;

/**
 * Reduce the stream to produce a single result.  Note that reducing an infinite
 * stream will return a Promise that never fulfills, but that may reject if an error
 * occurs.
 * If the initial value is not provided, the first item in the stream will be
 * used--note that the stream *must not* be empty.  If the stream *is* empty
 * and no initial value is provided, returns a rejected promise.
 * @param {function(result:*, x:*):*} f reducer function
 * @param {*} initial optional initial value
 * @returns {Promise} promise for the file result of the reduce
 */
Stream.prototype.reduce = function(f, initial) {
	return arguments.length > 1 ? reduce(f, initial, this) : reduce1(f, this);
};

//-----------------------------------------------------------------------
// Monoid

var monoid = require('./lib/combinators/monoid');
var concat = monoid.concat;

exports.empty  = monoid.empty;
exports.concat = concat;

/**
 * @param {Stream} right
 * @returns {Stream} new stream containing all items in this followed by
 *  all items in right
 */
Stream.prototype.concat = function(right) {
	return concat(this, right);
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
// Switching

var switching = require('./lib/combinators/switch');
var switchLatest = switching.switch;

exports.switch = switchLatest;

/**
 * Given a stream of streams, return a new stream that adopts the behavior
 * of the most recent inner stream.
 * @returns {Stream} switching stream
 */
Stream.prototype.switch = Stream.prototype.switchLatest = function() {
	return switchLatest(this);
};

//-----------------------------------------------------------------------
// Timers

var timed = require('./lib/combinators/timed');
var delay = timed.delay;
var delayOn = timed.delayOn;
var throttle = timed.throttle;
var throttleOn = timed.throttleOn;

exports.periodic   = timed.periodic;
exports.periodicOn = timed.periodicOn;
exports.delay      = delay;
exports.delayOn    = delayOn;
exports.throttle   = throttle;
exports.throttleOn = throttleOn;

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
 * @returns {Stream} new stream that skips events for throttle period
 */
Stream.prototype.throttle = function(period, scheduler) {
	return arguments.length > 1 ? throttleOn(scheduler, period, this)
		: throttle(period, this);
};
