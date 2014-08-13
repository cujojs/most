/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Stream = require('../Stream');
var promise = require('../promises');
var step = require('../step');

var when = promise.when;
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
 * @returns {Stream} stream containing only items for which predicate returns truthy
 */
function filter(p, stream) {
	var stepper = stream.step;
	return new Stream(function(state) {
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
 * @returns {Stream} stream containing items up to, but not including, the
 * first item for which p returns falsy.
 */
function takeWhile(p, stream) {
	var stepper = stream.step;
	return new Stream(function(s) {
		return when(function (i) {
			return i.done || p(i.value) ? i
				: new End();
		}, when(stepper, s));
	}, stream.state);
}

/**
 * @param {Number} n
 * @returns {Stream} stream containing at most the first n items from this stream
 */
function take(n, stream) {
	var stepper = stream.step;
	return new Stream(function(s) {
		if(s.value === 0) {
			return new End();
		}
		return when(function (i) {
			return i.done ? i : yieldPair(i, s.value - 1);
		}, when(stepper, s.state));
	}, new Pair(Math.max(0, n), stream.state));
}

/**
 * Remove adjacent duplicates: [a,b,b,c,b] -> [a,b,c,b]
 * @param {Stream} stream
 * @returns {Stream} stream with no adjacent duplicates using === to
 *  recognize duplicates
 */
function distinct(stream) {
	return distinctBy(same, stream);
}

/**
 * Remove adjacent duplicates: [a,b,b,c,b] -> [a,b,c,b]
 * @param {?function(a:*, b:*):boolean} equals optional function to compare items.
 * @param {Stream} stream
 * @returns {Stream} stream with no adjacent duplicates
 */
function distinctBy(equals, stream) {
	var stepper = stream.step;
	return new Stream(function(s) {
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