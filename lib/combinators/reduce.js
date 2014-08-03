var promise = require('../promises');
var asap = require('../asap');

var when = promise.when;

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
	return asap(reduceStep, f, z, stream.step, stream.state);
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
		return reduce(f, z, stream.tail());
	});
}

function reduceStep(f, z, stepper, state) {
	return when(function (i) {
		return i.done ? z
			: reduceStep(f, f(z, i.value), stepper, i.state);
	}, when(stepper, state));
}