/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Promise = require('when/es6-shim/Promise');

module.exports = delay;

/**
 * Return a promise that will be resolved with x after delayTime on the
 * provided scheduler.
 * @param {Number} delayTime delay after which the promise will be resolved with x
 * @param {*} x resolution
 * @param {Scheduler} scheduler scheduler on which to schedule the delay
 * @returns {Promise} promise that will be resolved after delayTime
 */
function delay(delayTime, x, scheduler) {
	return new Promise(function(resolve) {
		scheduler.delayed(delayTime, resolve, x);
	});
}