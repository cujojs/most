/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var asap = require('../asap');
var runStream = require('../runStream');

exports.drain = drain;

/**
 * Consume all events in the stream, without providing a function to process each.
 * This causes a stream to become active and begin emitting events, and is useful
 * in cases where all processing has been setup upstream via other combinators, and
 * there is no need to process the terminal events.
 * @param {Stream} stream stream to drain
 * @returns {Promise} promise that fulfills when the stream ends, or rejects
 *  if the stream fails with an unhandled error.
 */
function drain(stream) {
	return asap(runStream, noop, void 0, stream, stream.state, dispose);
}

function noop() {}

function dispose(stream, _, i) {
	return stream.dispose(i.time, i.value, i.state);
}
