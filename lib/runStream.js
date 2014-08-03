/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var promise = require('./promises');

var when = promise.when;
var resolve = promise.Promise.resolve;

module.exports = runStream;

/**
 * Consume a stream until end, processing each item, and finally
 * calling the supplied disposer.
 * @private
 * @param {function(z:*, x:*):*} f
 * @param {*} z
 * @param {Stream} stream
 * @param {*} state
 * @param {function(stream:Stream, z:*, i:End):*} dispose
 * @returns {Promise}
 */
function runStream(f, z, stream, state, dispose) {
	return resolve(when(stream.step, state)).then(function (i) {
		return i.done ? dispose(stream, z, i)
			: runStream(f, f(z, i.value), stream, i.state, dispose);
	});
}
