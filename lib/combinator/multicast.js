/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @contributor Maciej Ligenza */

var Stream = require('../Stream');
var MulticastSource = require('../source/MulticastSource');

exports.multicast = multicast;

/**
 * Transform the stream into a multicast stream, allowing it to be shared
 * more efficiently by many observers, without causing multiple invocation
 * of internal machinery.  Multicast is idempotent:
 * stream.multicast() === stream.multicast().multicast()
 * @param {Stream} stream to ensure is multicast.
 * @returns {Stream} new stream which will multicast events to all observers.
 */
function multicast(stream) {
	var source = stream.source;
	return source instanceof MulticastSource ? stream : new Stream(new MulticastSource(source));
}
