/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var promise = require('../promises');
var step = require('../step');

var when = promise.when;
var Yield = step.Yield;
var End = step.End;
var Pair = step.Pair;
var yieldPair = step.yieldPair;

var init = {};

exports.filter = filter;
exports.take = take;
exports.takeWhile = takeWhile;
exports.distinct = distinct;
exports.distinctBy = distinctBy;

/**
 * Retain only items matching a predicate
 * @param {function(x:*):boolean} p filtering predicate called for each item
 * @param {Stream} stream stream to filter
 * @returns {Stream} stream containing only items for which predicate returns truthy
 */
function filter(p, stream) {
	var stepper = stream.step;
	return stream.beget(function(state) {
		return filterNext(p, stepper, state);
	}, stream.state);
}

function filterNext(p, stepper, state) {
	return when(function(i) {
		return i.done || p(i.value) ? i
			: filterNext(p, stepper, i.state);
	}, when(stepper, state));
}

/**
 * @param {function(x:*):boolean} p
 * @param {Stream} stream stream from which to take
 * @returns {Stream} stream containing items up to, but not including, the
 * first item for which p returns falsy.
 */
function takeWhile(p, stream) {
	var stepper = stream.step;
	return stream.beget(function(s) {
		return when(function (i) {
			return i.done || p(i.value) ? i
				: new End(i.time, i.value, s.state);
		}, when(stepper, s));
	}, stream.state);
}

/**
 * @param {Number} n
 * @param {Stream} stream stream from which to take
 * @returns {Stream} stream containing at most the first n items from this stream
 */
function take(n, stream) {
	var stepper = stream.step;
	return stream.beget(function(s) {
		if(s.value === 0) {
			return new End(s.time, s.value, s.state);
		}
		return when(function (i) {
			return i.done ? i
				: i.withState(new Yield(i.time, s.value - 1, i.state));
		}, when(stepper, s.state));
	}, new Yield(stream.scheduler.now(), n|0, stream.state));
}

/**
 * Remove adjacent duplicates: [a,b,b,c,b] -> [a,b,c,b]
 * @param {Stream} stream stream from which to omit adjacent duplicates
 * @returns {Stream} stream with no adjacent duplicates using === to
 *  recognize duplicates
 */
function distinct(stream) {
	return distinctBy(same, stream);
}

/**
 * Remove adjacent duplicates: [a,b,b,c,b] -> [a,b,c,b]
 * @param {?function(a:*, b:*):boolean} equals optional function to compare items.
 * @param {Stream} stream stream from which to omit adjacent duplicates
 * @returns {Stream} stream with no adjacent duplicates
 */
function distinctBy(equals, stream) {
	var stepper = stream.step;
	return stream.beget(function(s) {
		return stepDistinct(equals, stepper, s);
	}, new Pair(init, stream.state));
}

function stepDistinct(equals, stepper, s) {
	return when(function(i) {
		if(i.done) {
			return i;
		}

		// Always allow the first item, and all non-duplicates
		if(s.value === init || !equals(s.value, i.value)) {
			return yieldPair(i, i.value);
		}

		return stepDistinct(equals, stepper, new Pair(s.value, i.state));
	}, when(stepper, s.state));
}

function same(a, b) {
	return a === b;
}