/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Stream = require('../Stream');
var promise = require('../promises');
var step = require('../step');

var when = promise.when;

var Pair = step.Pair;
var yieldPair = step.yieldPair;
var init = {};

exports.distinct = distinct;
exports.distinctBy = distinctBy;

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