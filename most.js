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
publish(Stream, exports);

//-----------------------------------------------------------------------
// Building

var build = require('./lib/combinators/build');
publish(build, exports);

var repeat = build.repeat;

/**
 * Tie this stream into a circle, thus creating an infinite stream
 * @returns {Stream} infinite stream that replays all items from this stream
 */
Stream.prototype.cycle = function() {
	return repeat(this).flatMap(identity);
};

//-----------------------------------------------------------------------
// Zipping

var zip = require('./lib/combinators/zip');
publish(zip, exports);

var zip2 = zip.zip;
var zip2With = zip.zipWith;

/**
 * Pair-wise combine items with those in s. Given 2 streams:
 * [1,2,3] zip [4,5,6] -> [[1,4],[2,5],[3,6]]
 * @param {Stream} s
 * @returns {Stream} new stream containing pairs
 */
Stream.prototype.zip = function(s) {
	return zip2(this, s);
};

/**
 * Pair-wise combine items with those in s. Given 2 streams:
 * [1,2,3] zipWith f [4,5,6] -> [f(1,4),f(2,5),f(3,6)]
 * @param {Stream} s
 * @returns {Stream} new stream containing pairs
 */
Stream.prototype.zipWith = function(f, s) {
	return zip2With(f, this, s);
};

//-----------------------------------------------------------------------
// Merging

var merge = require('./lib/combinators/merge');
publish(merge, exports);

var merge2 = merge.merge;
var mergeAll = merge.mergeAll;

/**
 * Merge this stream and s
 * @param {Stream} s
 * @returns {Stream} stream containing items from this stream and s in time
 * order.  If two events are simultaneous they will be merged in
 * arbitrary order.
 */
Stream.prototype.merge = function(s) {
	return merge2(this, s);
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

function publish(module, exports) {
	return Object.keys(module).reduce(function(exports, k) {
		exports[k] = module[k];
		return exports;
	}, exports);
}
