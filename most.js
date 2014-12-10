/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('./lib/Stream');
var base = require('./lib/base');
var core = require('./lib/source/core');
var from = require('./lib/source/from').from;
var periodic = require('./lib/source/periodic').periodic;

exports.Stream = Stream;

// Add of and empty to constructor for fantasy-land compat
exports.of       = Stream.of    = core.of;
exports.empty    = Stream.empty = core.empty;
exports.never    = core.never;
exports.from     = from;
exports.periodic = periodic;

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
exports.fromEvent = events.fromEvent;
exports.fromEventWhere = events.fromEventWhere;

//-----------------------------------------------------------------------
// Lifting functions

var lift = require('./lib/combinator/lift').lift;

exports.lift = lift;

//-----------------------------------------------------------------------
// Observing

var observe = require('./lib/combinator/observe');

exports.observe = observe.observe;
exports.forEach = observe.observe;
exports.drain   = observe.drain;

/**
 * Process all the events in the stream
 * @returns {Promise} promise that fulfills when the stream ends, or rejects
 *  if the stream fails with an unhandled error.
 */
Stream.prototype.observe = Stream.prototype.forEach = function(f) {
	return observe.observe(f, this);
};

/**
 * Consume all events in the stream, without providing a function to process each.
 * This causes a stream to become active and begin emitting events, and is useful
 * in cases where all processing has been setup upstream via other combinators, and
 * there is no need to process the terminal events.
 * @returns {Promise} promise that fulfills when the stream ends, or rejects
 *  if the stream fails with an unhandled error.
 */
Stream.prototype.drain = function() {
	return observe.drain(this);
};

//-------------------------------------------------------

var accumulate = require('./lib/combinator/accumulate');

exports.reduce = accumulate.reduce;
exports.scan   = accumulate.scan;

Stream.prototype.reduce = function(f, z) {
	return accumulate.reduce(f, z, this);
};

Stream.prototype.scan = function(f, z) {
	return accumulate.scan(f, z, this);
};

//-----------------------------------------------------------------------
// Building and extending

var build = require('./lib/combinator/build');

exports.iterate   = build.iterate;
exports.unfold    = build.unfold;
exports.repeat    = build.repeat;
exports.concat    = build.cycle;
exports.concat    = build.concat;
exports.startWith = build.cons;

Stream.prototype.cycle = function() {
	return build.cycle(this);
};

Stream.prototype.concat = function(tail) {
	return build.concat(this, tail);
};

Stream.prototype.startWith = function(x) {
	return build.cons(x, this);
};

//-----------------------------------------------------------------------
// Transforming

var transform = require('./lib/combinator/transform');

exports.map      = transform.map;
exports.ap       = transform.ap;
exports.constant = transform.constant;
exports.tap      = transform.tap;

Stream.prototype.map = function(f) {
	return transform.map(f, this);
};

Stream.prototype.ap = function(f) {
	return transform.ap(f, this);
};

Stream.prototype.constant = function(x) {
	return transform.constant(x, this);
};

Stream.prototype.tap = function(f) {
	return transform.tap(f, this);
};

//-----------------------------------------------------------------------
// Joining (flatMapping)

var join = require('./lib/combinator/join');

exports.flatMap = exports.chain = join.flatMap;
exports.join    = join.join;

Stream.prototype.join = function() {
	return join.join(this);
};

// alias chain for fantasy-land compat
Stream.prototype.flatMap = Stream.prototype.chain = function(f) {
	return join.flatMap(f, this);
};

var flatMapEnd = require('./lib/combinator/flatMapEnd').flatMapEnd;

exports.flatMapEnd = flatMapEnd;

Stream.prototype.flatMapEnd = function(f) {
	return flatMapEnd(f, this);
};

//-----------------------------------------------------------------------
// Merging

var merge = require('./lib/combinator/merge');

exports.merge = merge.merge;

Stream.prototype.merge = function(stream) {
	return merge.mergeArray([stream, this]);
};

//-----------------------------------------------------------------------
// Combining

var combine = require('./lib/combinator/combine');

exports.combine = combine.combine;

Stream.prototype.combine = function(f /*, ...streams*/) {
	return combine.combineArray(f, base.replace(this, 0, arguments));
};

//-----------------------------------------------------------------------
// Zipping

var zip = require('./lib/combinator/zip');

exports.zip = zip.zip;

Stream.prototype.zip = function(f /*, ...streams*/) {
	return zip.zipArray(f, base.replace(this, 0, arguments));
};

//-----------------------------------------------------------------------
// Switching

var switchLatest = require('./lib/combinator/switch').switch;

exports.switch       = switchLatest;
exports.switchLatest = switchLatest;

Stream.prototype.switch = Stream.prototype.switchLatest = function() {
	return switchLatest(this);
};

//-----------------------------------------------------------------------
// Filtering

var filter = require('./lib/combinator/filter');

exports.filter     = filter.filter;
exports.distinct   = filter.distinct;
exports.distinctBy = filter.distinctBy;

Stream.prototype.filter = function(p) {
	return filter.filter(p, this);
};

Stream.prototype.distinct = function() {
	return filter.distinct(this);
};

Stream.prototype.distinctBy = function(equals) {
	return filter.distinctBy(equals, this);
};

//-----------------------------------------------------------------------
// Slicing

var slice = require('./lib/combinator/slice');

exports.take      = slice.take;
exports.skip      = slice.skip;
exports.slice     = slice.slice;
exports.takeWhile = slice.takeWhile;
exports.skipWhile = slice.skipWhile;

Stream.prototype.take = function(n) {
	return slice.take(n, this);
};

Stream.prototype.skip = function(n) {
	return slice.skip(n, this);
};

Stream.prototype.slice = function(start, end) {
	return slice.slice(start, end, this);
};

Stream.prototype.takeWhile = function(p) {
	return slice.takeWhile(p, this);
};

Stream.prototype.skipWhile = function(p) {
	return slice.skipWhile(p, this);
};

//-----------------------------------------------------------------------
// Time slicing

var timeslice = require('./lib/combinator/timeslice');

exports.takeUntil = timeslice.takeUntil;
exports.skipUntil = timeslice.skipUntil;
exports.timeslice = timeslice.timeslice;

Stream.prototype.takeUntil = function(signal) {
	return timeslice.takeUntil(signal, this);
};

Stream.prototype.skipUntil = function(signal) {
	return timeslice.skipUntil(signal, this);
};

Stream.prototype.timeslice = function(min, max) {
	return timeslice.timeslice(min, max, this);
};

//-----------------------------------------------------------------------
// Delaying

var delay = require('./lib/combinator/delay').delay;

exports.delay = delay;

Stream.prototype.delay = function(dt) {
	return delay(dt, this);
};

//-----------------------------------------------------------------------
// Getting event timestamp

var timestamp = require('./lib/combinator/timestamp').timestamp;

exports.timestamp = timestamp;

Stream.prototype.timestamp = function() {
	return timestamp(this);
};

//-----------------------------------------------------------------------
// Rate limiting

var limit = require('./lib/combinator/limit');

exports.throttle = limit.throttle;
exports.debounce = limit.debounce;

Stream.prototype.throttle = function(dt) {
	return limit.throttle(dt, this);
};

Stream.prototype.debounce = function(dt) {
	return limit.debounce(dt, this);
};

//-----------------------------------------------------------------------
// Awaiting Promises

var promises = require('./lib/combinator/promises');

exports.fromPromise = promises.fromPromise;
exports.await       = promises.await;

Stream.prototype.await = function() {
	return promises.await(this);
};

//-----------------------------------------------------------------------
// Error handling

var errors = require('./lib/combinator/errors');


exports.flatMapError = errors.flatMapError;
exports.throwError   = errors.throwError;

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
	return errors.flatMapError(f, this);
};