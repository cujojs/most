/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var MulticastSource = require('./MulticastSource');
var fromSource = require('./fromSource');
var Stream = require('../Stream');

exports.create = create;

/**
 * Create a stream by imperatively pushing events.
 * @param {function(add:function(x), end:function(e)):function} run function
 *  that will receive 2 functions as arguments, the first to add new values to the
 *  stream and the second to end the stream. It may *return* a function that
 *  will be called once all consumers have stopped observing the stream.
 * @returns {Stream} stream containing all events added by run before end
 */
function create(run) {
	return fromSource(new MulticastSource(Stream.getDefaultScheduler(), run));
}
