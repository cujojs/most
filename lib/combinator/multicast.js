/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var MulticastSource = require('../source/MulticastSource');

exports.multicast = multicast;

/**
 * Transform the stream into multicast stream.  That means that many subscribers
 * to the stream will not cause multiple invokations of the internal machinery.
 * @param {Stream} stream to be transformed.
 * @returns {Stream} new stream which will multicast events to all observers.
 */
function multicast(stream) {
	return new Stream(new MulticastSource(stream.source));
}
