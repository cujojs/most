/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Stream = require('../Stream');
var promise = require('../promises');

var when = promise.when;
var resolve = promise.Promise.resolve;
var reject = promise.Promise.reject;

exports.flatMapError = flatMapError;
exports.throwError = throwError;

/**
 * Create a stream containing only an error
 * @param {*} e error value, preferably an Error or Error subtype
 * @returns {Stream} new stream containing only an error
 */
function throwError(e) {
	return new Stream(reject, e);
}

/**
 * If stream encounters an error, recover and continue with items from stream
 * returned by f.
 * stream:                  -a-b-c-X-
 * f(X):                           d-e-f-g-
 * flatMapError(f, stream): -a-b-c-d-e-f-g-
 * @param {function(error:*):Stream} f function which returns a new stream
 * @param {Stream} stream
 * @returns {Stream} new stream which will recover from an error by calling f
 */
function flatMapError(f, stream) {
	return stream.begetWithDispose(stepFlatMapError,
		{ stream: stream, state: stream.state, recover: f }, dispose);
}

function stepFlatMapError (s) {
	return resolve(s.state).then(function (state) {
		return stepWithRecovery(s.recover, s.stream, state);
	}).catch(function (e) {
		// TODO: Should we call s.stream.dispose here?
		var stream = s.recover(e);
		return stepWithRecovery(thrower, stream, stream.state);
	});
}

function stepWithRecovery(f, stream, state) {
	return when(function (i) {
		return i.withState({ stream: stream, state: i.state, recover: f });
	}, when(stream.step, state));
}

function dispose(t, x, s) {
	return s.stream.dispose(t, x, s.state);
}

function thrower(e) {
	throw e;
}
