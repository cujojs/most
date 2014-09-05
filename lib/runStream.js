/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var when = require('./promises').when;

module.exports = runStream;

/**
 * Consume a stream until end, processing each item, and finally
 * calling the supplied disposer.
 * @private
 * @param {function(z:*, x:*):*} f
 * @param {*} z
 * @param {function(*):Step} stepper
 * @param {*} state
 * @param {function(stream:Stream, z:*, i:End):*} dispose
 * @returns {Promise}
 */
function runStream(f, z, stream, state, dispose) {
	return when(function (i) {
		if(i.done) {
			return dispose(stream, z, i);
		}

		return runStream(f, f(z, i.value), stream, i.state, dispose);
	}, when(stream.step, state));
}

