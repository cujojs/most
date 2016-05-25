/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var run = require('../runSource').withDefaultScheduler;
var tap = require('./transform').tap;

exports.observe = observe;
exports.drain = drain;

/**
 * Observe all the event values in the stream in time order. The
 * provided function `f` will be called for each event value
 * @param {function(x:T):*} f function to call with each event value
 * @param {Stream<T>} stream stream to observe
 * @return {Promise} promise that fulfills after the stream ends without
 *  an error, or rejects if the stream ends with an error.
 */
function observe(f, stream) {
	return drain(tap(f, stream));
	// return runSource.withDefaultScheduler(f, stream.source);
}

var defaultScheduler = require('../scheduler/defaultScheduler');
var dispose = require('../disposable/dispose');

/**
 * "Run" a stream by
 * @param stream
 * @return {*}
 */
function drain(stream) {
	return run(stream.source);
}
