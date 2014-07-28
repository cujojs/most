/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var promise = require('./promises');
var step = require('./step');
var iterable = require('./iterable');
var base = require('./base');

module.exports = Stream;

var Promise = promise.Promise;
var when = promise.when;
var next = when;
var identity = base.identity;
var tail = base.tail;

/** @typedef {Yield|End} Step */

var Yield = Stream.Yield = step.Yield;
var End   = Stream.End   = step.End;

var getState = step.getState;
var getValueOrFail = step.getValueOrFail;
var Pair = step.Pair;

var iterableFrom = iterable.from;
var iterableHead = iterable.head;

/**
 * Stream that generates items by repeatedly calling the provided
 * step function.  It will generate the first item by calling step with
 * the provided initial state.  The step function must return a Step,
 * which may Yield a value and a new state to be provided to the next
 * call to step.
 * This constructor is functionality equivalent to using Stream.unfold
 * @param {function(state:*):Step} step stream step function
 * @param {*} state initial state
 * @constructor
 */
function Stream(step, state) {
	this.step = step;
	this.state = state;
}

/**
 * @returns {Stream} stream that contains no items, and immediately ends
 */
Stream.empty = function() {
	return new Stream(identity, new End());
};

/**
 * @param {*} x
 * @returns {Stream} stream that contains x as its only item
 */
Stream.of = function(x) {
	return new Stream(identity, one(x));
};

/**
 * Create a stream from an array-like or iterable
 * @param {Array|{iterator:function}|{next:function}|{length:Number}} iterable Array,
 *  array-like, iterable, or iterator
 * @returns {Stream} stream containing all items from the iterable
 */
Stream.from = function(iterable) {
	return new Stream(iterableHead, iterableFrom(iterable));
};

/**
 * @param {Promise} p
 * @returns {Stream} stream containing p's fulfillment value as its only item
 */
Stream.fromPromise = function(p) {
	return new Stream(identity, p.then(one));
};

/**
 * Observe all items in the stream
 * @param {function(*):undefined|Promise} f function which will be called
 *  for each item in the stream.  It may return a promise to exert a simple
 *  form of back pressure: f is guaranteed not to receive the next item in
 *  the stream before the promise fulfills.  Returning a non-promise has no
 *  effect on back pressure
 * @returns {Promise} promise that fulfills after all items have been observed,
 *  and the stream has ended.
 */
Stream.prototype.forEach = Stream.prototype.observe = function(f) {
	return immediate(runStream, f, this.step, this.state);
};

function runStream(f, stepper, state) {
	return when(function (s) {
		if (s.done) {
			return s.value;
		}

		return when(function (x) {
			return x instanceof End ? x.value
				: runStream(f, stepper, s.state);
		}, f(s.value));
	}, next(stepper, state));
}

/**
 * Transform each value in the stream by applying f to each
 * @param {function(*):*} f mapping function
 * @returns {Stream} stream containing items transformed by f
 */
Stream.prototype.map = function(f) {
	var stepper = this.step;
	return new Stream(function (state) {
		return mapNext(f, stepper, state);
	}, this.state);
};

function mapNext (f, stepper, state) {
	return when(function (i) {
		return i.map(f);
	}, next(stepper, state));
}

/**
 * Perform a side effect for each item in the stream
 * @param {function(x:*):*} f side effect to execute for each item. The
 *  return value will be discarded.
 * @returns {Stream} new stream containing the same items as this stream
 */
Stream.prototype.tap = function(f) {
	var stepper = this.step;
	return new Stream(function (state) {
		return tapNext(f, stepper, state);
	}, this.state);
};

function tapNext (f, stepper, state) {
	return when(function (i) {
		return i.done ? i : when(function() {
			return i;
		}, i.map(f));
	}, next(stepper, state));
}

/**
 * Assume this stream contains functions, and apply each function to each item
 * in the provided stream.  This generates, in effect, a cross product.
 * @param {Stream} xs stream of items to which
 * @returns {Stream} stream containing the cross product of items
 */
Stream.prototype.ap = function(xs) {
	return this.flatMap(function(f) {
		return xs.map(f);
	});
};

/**
 * Map each value in the stream to a new stream, and emit its values
 * into the returned stream.
 * @param {function(x:*):Stream} f chaining function, must return a Stream
 * @returns {Stream} new stream containing all items from each stream returned by f
 */
Stream.prototype.flatMap = Stream.prototype.chain = function(f) {
	return new Stream(stepChain, new Outer(f, this));

	function stepChain(s) {
		return s.step(stepChain);
	}
};

function Outer(f, outer) {
	this.f = f; this.outer = outer; this.inner = void 0;
}

Outer.prototype.step = function(stepNext) {
	return stepOuter(stepNext, this.f, this.outer);
};

function Inner(f, outer, inner) {
	this.f = f; this.outer = outer; this.inner = inner;
}

Inner.prototype.step = function(stepNext) {
	return stepInner(stepNext, this.f, this.outer, this.inner);
};

function stepOuter(stepNext, f, outer) {
	return when(function(i) {
		return i.done ? i
			: stepInner(stepNext, f, new Stream(outer.step, i.state), f(i.value));
	}, Promise.resolve(streamNext(outer)));
}

function stepInner(stepNext, f, outer, inner) {
	return when(function(ii) {
		return ii.done ? stepOuter(stepNext, f, outer)
			: new Yield(ii.value, new Inner(f, outer, new Stream(inner.step, ii.state)));
	}, Promise.resolve(streamNext(inner)));
}

/**
 * @returns {Promise} a promise for the first item in the stream
 */
Stream.prototype.head = function() {
	return when(getValueOrFail, Promise.resolve(streamNext(this)));
};

/**
 * @returns {Stream} a stream containing all items in this stream except the first
 */
Stream.prototype.tail = function() {
	return new Stream(this.step, when(getState, streamNext(this)));
};

/**
 * @param {*} x
 * @returns {Stream} new stream containing x followed by all items in this stream
 */
Stream.prototype.startWith = function(x) {
	return Stream.of(x).concat(this);
};

/**
 * @param {Stream} s
 * @returns {Stream} new stream containing all items in this stream followed by
 *  all items in s
 */
Stream.prototype.concat = function(s) {
	return new Stream(identity, two(this, s)).flatMap(identity);
};

/**
 * Create a stream containing successive reduce results of applying f to
 * the previous reduce result and the current stream item.
 * @param {function(result:*, x:*):*} f reducer function
 * @param {*} initial initial value
 * @returns {Stream} new stream containing successive reduce results
 */
Stream.prototype.scan = function(f, initial) {
	var stepper = this.step;
	return new Stream(function(s) {
		return scanNext(f, stepper, s);
	}, new Pair(initial, this.state));
};

function scanNext (f, stepper, s) {
	return when(function (i) {
		if (i.done) {
			return i;
		}

		var value = f(s.value, i.value);
		return new Yield(value, new Pair(value, i.state));
	}, next(stepper, s.state));
}

/**
 * Reduce this stream to produce a single result.  Note that reducing an infinite
 * stream will return a Promise that never fulfills, but that may reject if an error
 * occurs.
 * @param {function(result:*, x:*):*} f reducer function
 * @param {*} initial initial value
 * @returns {Promise} promise for the file result of the reduce
 */
Stream.prototype.reduce = function(f, initial) {
	return immediate(reduce, f, initial, this.step, this.state);
};

function reduce(f, z, stepper, state) {
	return when(function (i) {
		return i.done ? z
			: reduce(f, f(z, i.value), stepper, i.state);
	}, next(stepper, state));
}

// Helpers

function streamNext(s) {
	return next(s.step, s.state);
}

function one(x) {
	return new Yield(x, new End());
}

function two(x, y) {
	return new Yield(x, new Yield(y, new End()));
}

function immediate(f) {
	return Promise.resolve(tail(arguments)).then(function(args) {
		return f.apply(void 0, args);
	});
}
