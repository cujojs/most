/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var asap = require('../asap');
var runStream = require('../runStream');

exports.observe = observe;

/**
 * Observe all items in stream
 * @param {function(*):undefined|Promise} f function which will be called
 *  for each item in the stream.  It may return a promise to exert a simple
 *  form of back pressure: f is guaranteed not to receive the next item in
 *  the stream before the promise fulfills.  Returning a non-promise has no
 *  effect on back pressure
 * @param {Stream} stream stream to observe
 * @returns {Promise} promise that fulfills after all items have been observed,
 *  and the stream has ended.
 */
function observe(f, stream) {
	return asap(runStream, function(z, x) {
		return f(x);
	}, void 0, stream, stream.state, dispose);
}

function dispose(stream, _, i) {
	return stream.dispose(i.time, i.value, i.state);
}
