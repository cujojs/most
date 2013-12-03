/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author Brian Cavalier
 * @author John Hann
 */

var Stream = require('./Stream');
var asyncEvery = require('./array/async');

module.exports = create;

create.of = Stream.of;
create.empty = Stream.empty;
create.fromArray = fromArray;
create.fromItem = fromItems;
create.fromEventTarget = fromEventTarget;
create.fromEventEmitter = fromEventEmitter;
create.fromPromise = fromPromise;

var slice = Array.prototype.slice;

/**
 * (f, g) -> h -> Stream
 * @param {function(next, end):function} emitter accepts a next and end function, and
 * emits events by calling next.  It may call end with no arguments
 * to signal that it will never call next again, or with one error
 * argument to signal that it has encountered an unrecoverable error.
 * It should return a function that the caller can use to unsubscribe
 * from further events.
 * @return {Stream} stream
 */
function create(emitter) {
	return new Stream(emitter);
}

/**
 * ArrayLike -> Stream
 * @param {array} array Array-like
 * @return {Stream} stream
 */
function fromArray(array) {
	return new Stream(function(next, end) {
		asyncEvery(array, next, end);

		return noop;
	});
}

/**
 * arguments -> Stream
 * @param {...*?} items
 * @return {Stream} stream
 */
function fromItems() {
	return fromArray(slice.call(arguments));
}

// EventTarget -> String -> Stream
// Create an event stream from a w3c EventTarget
/**
 * Create a Stream from a w3c EventTarget
 * @param {EventTarget} eventTarget
 * @param {string} eventType type of events (e.g. "click", "message", etc.)
 * @returns {Stream} stream
 */
function fromEventTarget(eventTarget, eventType) {
	return new Stream(function(next) {
		eventTarget.addEventListener(eventType, next, false);

		return function() {
			eventTarget.removeEventListener(eventType, next, false);
		};
	});
}

// EventEmitter -> String -> Stream
// Create an event stream from a typical EventEmitter
function fromEventEmitter(eventEmitter, eventType) {
	return new Stream(function(next) {
		eventEmitter.on(eventType, next);

		return function() {
			eventEmitter.off(eventType, next);
		};
	});
}

// Promise -> Stream
// Create a stream containing only a single item, the promise's
// fulfillment value.  If the promise rejects, end will be called
// with the rejection reason.
function fromPromise(promise) {
	return new Stream(function(next, end) {
		promise.then(next).then(function() { end(); }, end);

		return noop;
	});
}

Object.keys(Stream.prototype).reduce(function(exports, key) {
	var method = Stream.prototype[key];

	if(typeof method === 'function') {
		exports[key] = curry([], method.length + 1, function(args) {
			return method.apply(args.pop(), args);
		});
	}

	return exports;
}, create);

function curry(args, arity, f) {
	return function() {
		var accumulated = args.concat(slice.call(arguments));

		return accumulated.length < arity
			? curry(accumulated, arity, f)
			: f(accumulated);
	};
}

function noop() {}
