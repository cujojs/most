/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var curry = require('./lib/curry');
var base = require('./lib/base');

var identity = base.identity;
var cons = base.cons;
var tail = base.tail;

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

exports.unfold  = curry(build.unfold);
exports.iterate = curry(build.iterate);
exports.repeat  = repeat;
exports.cons = exports.startWith = curry(consStream);

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

var create = require('./lib/source/create');

/**
 * Create a stream by imperatively pushing events.
 * @param {function(add:function(x), end:function(e)):function} run function
 *  that will receive 2 functions as arguments, the first to add new values to the
 *  stream and the second to end the stream. It may *return* a function that
 *  will be called once all consumers have stopped observing the stream.
 * @returns {Stream} stream containing all events added by run before end
 */
exports.create = create.create;

//-----------------------------------------------------------------------
// Adapting other sources

var events = require('./lib/source/fromEvent');

/**
 * Create a stream of events from the supplied EventTarget or EventEmitter
 * @param {String} event event name
 * @param {EventTarget|EventEmitter} source EventTarget or EventEmitter. The source
 *  must support either addEventListener/removeEventListener (w3c EventTarget:
 *  http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventTarget),
 *  or addListener/removeListener (node EventEmitter: http://nodejs.org/api/events.html)
 * @returns {Stream} stream of events of the specified type from the source
 */
exports.fromEvent = curry(events.fromEvent);

//-----------------------------------------------------------------------
// Observing

var observing = require('./lib/combinators/observe');
var observe = observing.observe;

exports.forEach      = exports.observe      = curry(observe);

/**
 * Process all the events in the stream
 * @type {Function}
 */
Stream.prototype.forEach = Stream.prototype.observe = function(f) {
	return observe(f, this);
};

//-----------------------------------------------------------------------
// Transforming

var transform = require('./lib/combinators/transform');

var map = transform.map;
var ap = transform.ap;
var flatMap = transform.flatMap;
var scan = transform.scan;
var tap = transform.tap;

exports.map     = curry(map);
exports.ap      = curry(ap);
exports.flatMap = exports.chain = curry(flatMap);
exports.flatten = flatten;
exports.scan    = curry(scan);
exports.tap     = curry(tap);

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
var takeUntil = filter.takeUntil;
var take = filter.take;
var takeWhile = filter.takeWhile;
var distinctSame = filter.distinct;
var distinctBy = filter.distinctBy;

exports.filter     = curry(filterStream);
exports.takeUntil  = curry(takeUntil);
exports.take       = curry(take);
exports.takeWhile  = curry(takeWhile);
exports.distinct   = curry(distinctSame);
exports.distinctBy = curry(distinctBy);

/**
 * Retain only items matching a predicate
 * stream:                           -12345678-
 * filter(x => x % 2 === 0, stream): --2-4-6-8-
 * @param {function(x:*):boolean} p filtering predicate called for each item
 * @returns {Stream} stream containing only items for which predicate returns truthy
 */
Stream.prototype.filter = function(p) {
	return filterStream(p, this);
};

/**
 * stream:                    -a-b-c-d-e-f-g-
 * signal:                    -------x
 * takeUntil(signal, stream): -a-b-c-
 * @param {Stream} signal retain only events in stream before the first
 * event in signal
 * @param {Stream} stream events to retain
 * @returns {Stream} new stream containing only events that occur before
 * the first event in signal.
 */
Stream.prototype.takeUntil = function(signal) {
	return takeUntil(signal, this);
};

/**
 * stream:          -abcd-
 * take(2, stream): -ab
 * @param {Number} n take up to this many events
 * @returns {Stream} stream containing at most the first n items from this stream
 */
Stream.prototype.take = function(n) {
	return take(n, this);
};

/**
 * stream:                        -123451234-
 * takeWhile(x => x < 5, stream): -1234
 * @param {function(x:*):boolean} p
 * @returns {Stream} stream containing items up to, but not including, the
 * first item for which p returns falsy.
 */
Stream.prototype.takeWhile = function(p) {
	return takeWhile(p, this);
};

/**
 * Remove adjacent duplicates
 * stream:           -abbcd-
 * distinct(stream): -ab-cd-
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

exports.reduce  = curry(reduce);
exports.reduce1 = curry(reduce1);

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
exports.concat = curry(concat);

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

exports.zip          = curry(zip.zip);
exports.zipWith      = curry(zip.zipWith);
exports.zipArray     = curry(zipArray);
exports.zipArrayWith = curry(zipArrayWith);

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
	return zipArrayWith(f, cons(this, tail(arguments)));
};

//-----------------------------------------------------------------------
// Merging

var merge = require('./lib/combinators/merge');
var mergeArray = merge.mergeArray;
var mergeAll = merge.mergeAll;

exports.merge      = curry(merge.merge);
exports.mergeArray = curry(mergeArray);
exports.mergeAll   = curry(mergeAll);

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
var debounce = timed.debounce;
var debounceOn = timed.debounceOn;

exports.periodic   = timed.periodic;
exports.periodicOn = curry(timed.periodicOn);
exports.delay      = curry(delay);
exports.delayOn    = curry(delayOn);
exports.throttle   = curry(throttle);
exports.throttleOn = curry(throttleOn);
exports.debounce   = curry(debounce);
exports.debounceOn = curry(debounceOn);

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
 * Limit the rate of events
 * stream:              abcd----abcd----
 * throttle(2, stream): a-c-----a-c-----
 * @param {Number} period time to suppress events
 * @param {Scheduler=} scheduler optional scheduler
 * @returns {Stream} new stream that skips events for throttle period
 */
Stream.prototype.throttle = function(period, scheduler) {
	return arguments.length > 1 ? throttleOn(scheduler, period, this)
		: throttle(period, this);
};

/**
 * Wait for a burst of events to subside and emit only the last event in the burst
 * stream:              abcd----abcd----
 * debounce(2, stream): -----d-------d--
 * @param {Number} period events occuring more frequently than this
 *  on the provided scheduler will be suppressed
 * @param {Scheduler=} scheduler optional scheduler
 * @returns {Stream} new debounced stream
 */
Stream.prototype.debounce = function(period, scheduler) {
	return arguments.length > 1 ? debounceOn(scheduler, period, this)
		: debounce(period, this);
};

//-----------------------------------------------------------------------
// Error handling

var error = require('./lib/combinators/error');

var flatMapError = error.flatMapError;
var throwError = error.throwError;

exports.flatMapError = curry(flatMapError);
exports.throwError   = throwError;

/**
 * If this stream encounters an error, recover and continue with items from stream
 * returned by f.
 * stream:                  -a-b-c-X-
 * f(X):                           d-e-f-g-
 * flatMapError(f, stream): -a-b-c-d-e-f-g-
 * @param {function(error:*):Stream} f function which returns a new stream
 * @returns {Stream} new stream which will recover from an error by calling f
 */
Stream.prototype.flatMapError = function(f) {
	return flatMapError(f, this);
};