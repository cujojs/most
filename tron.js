/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Brian Cavalier
 * @author: John Hann
 */

// TODO: take, takeWhile, takeUntil, drop, dropWhile, takeUntil
// TODO: streams from iterable/iterator/generator
// TODO: move delay?

var Stream = require('./Stream');

module.exports = create;

create.of = Stream.of;
create.empty = Stream.empty;
create.fromArray = fromArray;
create.fromItem = fromItems;
create.fromEventTarget = fromEventTarget;
create.fromPromise = fromPromise;

function create(emitter) {
	return new Stream(emitter);
}

function fromArray(array) {
	return new Stream(function(next, end) {
		var error;
		try {
			array.forEach(function(x) {
				next(x);
			});
		} catch(e) {
			error = e;
		}

		end && end(error);
	});
}

function fromItems() {
	return fromArray(Array.prototype.slice.call(arguments));
}

function fromEventTarget(eventTarget, eventType) {
	return new Stream(function(next) {
		eventTarget.addEventListener(eventType, next, false);
	});
}

function fromPromise(promise) {
	return new Stream(function(next, end) {
		promise.then(next, end);
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

var slice = [].slice;
function curry(args, arity, f) {
	return function() {
		var accumulated = args.concat(slice.call(arguments));

		return accumulated.length < arity
			? curry(accumulated, arity, f)
			: f(accumulated);
	};
}