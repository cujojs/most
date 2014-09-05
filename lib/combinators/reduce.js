/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var asap = require('../asap');
var runStream = require('../runStream');
var when = require('../promises').when;

exports.reduce = reduce;
exports.reduce1 = reduce1;

/**
 * Reduce a stream to produce a single result.  Note that reducing an infinite
 * stream will return a Promise that never fulfills, but that may reject if an error
 * occurs.
 * @param {function(result:*, x:*):*} f reducer function
 * @param {*} z initial value
 * @param {Stream} stream to reduce
 * @returns {Promise} promise for the file result of the reduce
 */
function reduce(f, z, stream) {
	return asap(runStream, f, z, stream, stream.state, disposeReduce);
}

/**
 * Reduce a stream to produce a single result, using the first item in the stream
 * as the initial value.  If the stream is empty, returns a rejected promise.
 * Note that reducing an infinite stream will return a Promise that never
 * fulfills, but that may reject if an error occurs.
 * @param {function(result:*, x:*):*} f reducer function
 * @param {Stream} stream to reduce
 * @returns {Promise} promise for the file result of the reduce
 */
function reduce1(f, stream) {
	return stream.head().then(function(z) {
		var tail = stream.tail();
		return runStream(f, z, tail, tail.state, disposeReduce);
	});
}

function disposeReduce(stream, z, i) {
	return when(function() {
		return z;
	}, stream.dispose(i.time, i.value, i.state));
}