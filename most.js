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
var async = require('./async');

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
		var subscribed = true;

		async(function() {
			if(!subscribed) {
				return;
			}

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

		return function() {
			subscribed = false;
		}
	});
}

function fromItems() {
	return fromArray(Array.prototype.slice.call(arguments));
}

function fromEventTarget(eventTarget, eventType) {
	return new Stream(function(next) {
		eventTarget.addEventListener(eventType, next, false);

		return function() {
			eventTarget.removeEventListener(eventType, next, false);
		};
	});
}

function fromPromise(promise) {
	return new Stream(function(next, end) {
		var subscribed = true;

		function safeNext(x) {
			subscribed && next(x);
		}

		function safeEnd(e) {
			if(subscribed) {
				subscribed = false;
				end && end(e);
			}
		}

		promise.then(safeNext).then(
			function() { safeEnd(); },
			safeEnd);

		return function() {
			subscribed = false;
		};
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
