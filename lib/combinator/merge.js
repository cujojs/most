/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var empty = require('../Stream').empty;
var fromArray = require('../source/fromArray').fromArray;
var join = require('./flatMap').join;
var copy = require('../base').copy;

exports.merge = merge;
exports.mergeArray = mergeArray;

/**
 * @returns {Stream} stream containing events from all streams in the argument
 * list in time order.  If two events are simultaneous they will be merged in
 * arbitrary order.
 */
function merge(/*...streams*/) {
	return mergeArray(copy(arguments));
}

/**
 * @param {Array} streams array of stream to merge
 * @returns {Stream} stream containing events from all input observables
 * in time order.  If two events are simultaneous they will be merged in
 * arbitrary order.
 */
function mergeArray(streams) {
	return streams.length === 0 ? empty()
		 : streams.length === 1 ? streams[0]
		 : join(fromArray(streams));
}
