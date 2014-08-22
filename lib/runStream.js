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
 * @param {function(i:End, z:*):*} dispose
 * @returns {Promise}
 */
function runStream(f, z, stepper, state, dispose) {
	return when(function (i) {
		if(i.done) {
			return dispose(i, z);
		}

		return runStream(f, f(z, i.value), stepper, i.state, dispose);
	}, when(stepper, state));
}

