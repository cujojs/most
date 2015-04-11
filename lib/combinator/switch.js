/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var MulticastSource = require('../source/MulticastSource');
var until = require('./timeslice').takeUntil;
var concurrentMergeMap = require('./concurrentMergeMap').concurrentMergeMap;

exports.switch = switchLatest;

/**
 * Given a stream of streams, return a new stream that adopts the behavior
 * of the most recent inner stream.
 * @param {Stream} stream of streams on which to switch
 * @returns {Stream} switching stream
 */
function switchLatest(stream) {
	var upstream = new Stream(new MulticastSource(stream.source));

	return concurrentMergeMap(untilNext, 1, upstream);

	function untilNext(s) {
		return until(upstream, s);
	}
}
