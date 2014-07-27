/**
 * Discrete event stream type
 * @type {Stream}
 */
var Stream = require('./lib/Stream');
addExports(Stream, exports);

//-----------------------------------------------------------------------
// Zip

var zip = require('./lib/combinators/zip');
addExports(zip, exports);

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
// Merge

var merge = require('./lib/combinators/merge');
addExports(merge, exports);

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

function addExports(module, exports) {
	return Object.keys(module).reduce(function(exports, k) {
		exports[k] = module[k];
		return exports;
	}, exports);
}
