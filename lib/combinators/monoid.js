/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Stream = require('../Stream');
var flatMap = require('./transform').flatMap;
var step = require('../step');
var identity = require('../base').identity;

var Yield = step.Yield;
var End = step.End;

exports.empty = empty;
exports.concat = concat;

/**
 * @returns {Stream} stream that contains no items, and immediately ends
 */
function empty() {
	return new Stream(identity, new End());
}

/**
 * @param {Stream} left
 * @param {Stream} right
 * @returns {Stream} new stream containing all items in left followed by
 *  all items in right
 */
function concat(left, right) {
	return flatMap(identity, new Stream(identity, two(left, right)));
}

/**
 * Create a Step that yields a then b
 * @param {*} a
 * @param {*} b
 * @returns {Yield}
 */
function two(a, b) {
	return new Yield(a, new Yield(b, new End()));
}
