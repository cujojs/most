/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Stream = require('../Stream');
var Queue = require('../Queue');

exports.create = create;

/**
 * Create a stream by calling producer with functions for adding items to
 * the stream and for ending the stream.
 * @param {function(add:function(x:*), end:function(error?:Error))} producer
 * @returns {Stream}
 */
function create(producer) {
	var q = new Queue();

	producer(add, end);

	return Stream.from(q);

	function add(x) {
		if(q.ended) {
			return;
		}
		q.add(x);
	}

	function end(x) {
		if(q.ended) {
			return;
		}
		q.end(x);
	}
}
