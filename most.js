/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('./lib/Stream');
var base = require('./lib/base');

exports.empty = Stream.empty;
exports.never = Stream.never;

exports.of = require('./lib/combinator/of').of;
exports.from = require('./lib/combinator/fromArray').fromArray;

exports.periodic = require('./lib/combinator/periodic').periodic;
exports.create = require('./lib/combinator/create').create;

var events = require('./lib/combinator/fromEvent');
exports.fromEvent = events.fromEvent;
exports.fromEventWhere = events.fromEventWhere;

exports.lift = require('./lib/combinator/lift').lift;

//-------------------------------------------------------

var observe = require('./lib/combinator/observe');

Stream.prototype.observe = function(f) {
	return observe.observe(f, this);
};

Stream.prototype.drain = function() {
	return observe.drain(this);
};

//-------------------------------------------------------

var accumulate = require('./lib/combinator/accumulate');

Stream.prototype.reduce = function(f, z) {
	return accumulate.reduce(f, z, this);
};

Stream.prototype.scan = function(f, z) {
	return accumulate.scan(f, z, this);
};

//-------------------------------------------------------

var build = require('./lib/combinator/build');

exports.iterate = build.iterate;
exports.unfold = build.unfold;

Stream.prototype.startWith = Stream.prototype.cons = function(x) {
	return build.cons(x, this);
};

Stream.prototype.concat = function(tail) {
	return build.concat(this, tail);
};

//-------------------------------------------------------

var transform = require('./lib/combinator/transform');

Stream.prototype.map = function(f) {
	return transform.map(f, this);
};

Stream.prototype.constant = function(x) {
	return transform.constant(x, this);
};

//-------------------------------------------------------

var flatMap = require('./lib/combinator/join');

Stream.prototype.join = function() {
	return flatMap.join(this);
};

Stream.prototype.flatMap = function(f) {
	return flatMap.flatMap(f, this);
};

var flatMapEnd = require('./lib/combinator/flatMapEnd').flatMapEnd;

Stream.prototype.flatMapEnd = function(f) {
	return flatMapEnd(f, this);
};

//-------------------------------------------------------

var switchLatest = require('./lib/combinator/switch').switch;

Stream.prototype.switch = function() {
	return switchLatest(this);
};

//-------------------------------------------------------

var filter = require('./lib/combinator/filter');

Stream.prototype.filter = function(p) {
	return filter.filter(p, this);
};

Stream.prototype.distinct = function() {
	return filter.distinct(this);
};

Stream.prototype.distinctBy = function(equals) {
	return filter.distinctBy(equals, this);
};

//-------------------------------------------------------

var slice = require('./lib/combinator/slice');

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

//-------------------------------------------------------

var timeslice = require('./lib/combinator/timeslice');

Stream.prototype.takeUntil = function(signal) {
	return timeslice.takeUntil(signal, this);
};

Stream.prototype.skipUntil = function(signal) {
	return timeslice.skipUntil(signal, this);
};

//-------------------------------------------------------

var merge = require('./lib/combinator/merge');

exports.merge = merge.merge;

Stream.prototype.merge = function(stream) {
	return merge.mergeArray([stream, this]);
};

//-------------------------------------------------------

var combine = require('./lib/combinator/combine');

exports.combine = combine.combine;

Stream.prototype.combine = function(f /*, ...streams*/) {
	return combine.combineArray(f, base.replace(this, 0, arguments));
};

//-------------------------------------------------------

var delay = require('./lib/combinator/delay');

Stream.prototype.delay = function(dt) {
	return delay.delay(dt, this);
};

//-------------------------------------------------------

var limit = require('./lib/combinator/limit');

Stream.prototype.throttle = function(dt) {
	return limit.throttle(dt, this);
};

Stream.prototype.debounce = function(dt) {
	return limit.debounce(dt, this);
};

//-------------------------------------------------------

var promises = require('./lib/combinator/promises');

exports.fromPromise = promises.fromPromise;

Stream.prototype.await = function() {
	return promises.await(this);
};
