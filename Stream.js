/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Scheduler = require('./lib/Scheduler');
var Promise = require('./lib/Promise');
var delay = require('./lib/delay');
var step = require('./lib/step');
var iterable = require('./lib/iterable');

module.exports = Stream;

/** @typedef {Yield|Skip|End} Step */

var Yield = Stream.Yield = step.Yield;
var Skip  = Stream.Skip  = step.Skip;
var End   = Stream.End   = step.End;

var iterableFrom = iterable.from;
var iterableHead = iterable.head;

/**
 * A stream that generates items by repeatedly calling the provided
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
 * Build a stream by unfolding steps from a seed value
 * @param {function(x:*):Step} f
 * @param {*} x seed value
 * @returns {Stream} stream containing all items
 */
Stream.unfold = function(f, x) {
	return new Stream(f, x);
};

/**
 * Build a stream by iteratively calling f
 * @param {function(x:*):*} f
 * @param {*} x initial value
 * @returns {Stream}
 */
Stream.iterate = function(f, x) {
	return new Stream(function(x) {
		return new Yield(x, f(x));
	}, x);
};

/**
 * Create an infinite stream of xs
 * @param {*} x
 * @returns {Stream} infinite stream where all items are x
 */
Stream.repeat = function(x) {
	return new Stream(repeat, x);
};

/**
 * Create a stream that emits the current time periodically
 * @param {Number} period
 * @param {?Scheduler} scheduler optional scheduler to use
 * @returns {Stream} new stream that emits the current time every period
 */
Stream.periodic = function(period, scheduler) {
	return new Stream(function(p) {
		var now = p.state.now();
		return delay(p.value, new Yield(now, p), p.state);
	}, new Pair(Math.max(1, period), ensureScheduler(scheduler)));
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
	return runStream(f, this.step, this.state);
};

function runStream(f, stepper, state) {
	return next(stepper, state).then(function(s) {
		if (s.done) {
			return s.value;
		}

		return Promise.resolve(f(s.value)).then(function (x) {
			return x instanceof End ? x.value
				: runStream(f, stepper, s.state);
		});
	});
}

/**
 * @param {Number} delayTime milliseconds to delay each item
 * @param {?Scheduler} scheduler optional scheduler to use
 * @returns {Stream} new stream containing the same items, but delayed by ms
 */
Stream.prototype.delay = function(delayTime, scheduler) {
	scheduler = ensureScheduler(scheduler);

	var stepper = this.step;
	return new Stream(function(s) {
		return next(stepper, s.state).then(function(i) {
			return i.done ? i
				: delay(s.value, yieldPair(i, s.value), scheduler);
		});
	}, new Pair(delayTime, this.state));
};

/**
 * Skip events for period time after the most recent event
 * @param {Number} period time to suppress events
 * @param {Scheduler} scheduler optional scheduler
 * @returns {Stream}
 */
Stream.prototype.debounce = function(period, scheduler) {
	scheduler = ensureScheduler(scheduler);

	var stepper = this.step;
	return new Stream(function(s) {
		return next(stepper, s.state).then(function(i) {
			if(i.done) {
				return i;
			}

			var now = scheduler.now();
			var end = s.value;
			return now > end ? yieldPair(i, now + period) : skipPair(i, end);
		});
	}, new Pair(scheduler.now(), this.state));
};

/**
 * Transform each value in the stream by applying f to each
 * @param {function(*):*} f mapping function
 * @returns {Stream} stream containing items transformed by f
 */
Stream.prototype.map = function(f) {
	var stepper = this.step;
	return new Stream(function (state) {
		return next(stepper, state).then(function(i) {
			return i.done ? i
				: new Yield(f(i.value), i.state);
		});
	}, this.state);
};

/**
 * Perform a side effect for each item in the stream
 * @param {function(x:*):*} f side effect to execute for each item. The
 *  return value will be discarded.
 * @returns {Stream} new stream containing the same items as this stream
 */
Stream.prototype.tap = function(f) {
	return this.map(function(x) {
		f(x);
		return x;
	});
};

/**
 * Assume this stream contains functions, and apply each function to each item
 * in the provided stream.  This generates, in effect, a cross product.
 * @param {Stream} xs stream of items to which
 * @returns {Stream} stream containing the cross product of items
 */
Stream.prototype.ap = function(xs) {
	return this.chain(function(f) {
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
		return s.inner === void 0 ? stepOuter(stepChain, s.f, s.outer)
			: stepInner(stepChain, s.f, s.outer, s.inner);
	}
};

function stepOuter(stepChain, f, outer) {
	return streamNext(outer).then(function(i) {
		return i.done ? i
			: stepInner(stepChain, f, new Stream(outer.step, i.state), f(i.value));
	});
}

function stepInner(stepChain, f, outer, inner) {
	return streamNext(inner).then(function(ii) {
		return ii.done ? stepChain(new Outer(f, outer))
			: new Yield(ii.value, new Inner(f, outer, new Stream(inner.step, ii.state)));
	});
}

/**
 * Retain only items matching a predicate
 * @param {function(x:*):boolean} p filtering predicate called for each item
 * @returns {Stream} stream containing only items for which predicate returns truthy
 */
Stream.prototype.filter = function(p) {
	var stepper = this.step;
	return new Stream(function(state) {
		return next(stepper, state).then(function(i) {
			return i.done || p(i.value) ? i
				: new Skip(i.state);
		});
	}, this.state);
};

/**
 * Remove adjacent duplicates: [a,b,b,c,b] -> [a,b,c,b]
 * @param {?function(a:*, b:*):boolean} equals optional function to compare items.
 *  default: ===
 * @returns {Stream} stream with no adjacent duplicates
 */
Stream.prototype.distinct = function(equals) {
	if(typeof equals !== 'function') {
		equals = same;
	}

	var stepper = this.step;
	return new Stream(function(s) {
		return next(stepper, s.state).then(function(i) {
			if(i.done) {
				return i;
			}
			return equals(s.value, i.value) ? skipPair(i, s.value)
				: yieldPair(i, i.value);
		});
	}, new Pair({}, this.state));
};

/**
 * @returns {Promise} a promise for the first item in the stream
 */
Stream.prototype.head = function() {
	return streamNext(this).then(getValueOrFail);
};

/**
 * @returns {Stream} a stream containing all items in this stream except the first
 */
Stream.prototype.tail = function() {
	return new Stream(this.step, streamNext(this).then(getState));
};

/**
 * @param {function(x:*):boolean} p
 * @returns {Stream} stream containing items up to, but not including, the
 * first item for which p returns falsy.
 */
Stream.prototype.takeWhile = function(p) {
	var stepper = this.step;
	return new Stream(function(s) {
		return next(stepper, s).then(function(i) {
			return i.done || p(i.value) ? i
				: new End();
		});
	}, this.state);
};

/**
 * @param {Number} n
 * @returns {Stream} stream containing at most the first n items from this stream
 */
Stream.prototype.take = function(n) {
	var stepper = this.step;
	return new Stream(function(s) {
		return next(stepper, s.state).then(function(i) {
			var remaining = s.value - 1;
			return i.done ? i
				: s.value === 0 ? new End(i.value)
				: yieldPair(i, remaining);
		});
	}, new Pair(n, this.state));
};

/**
 * Tie this stream into a circle, thus creating an infinite stream
 * @returns {Stream} infinite stream that replays all items from this stream
 */
Stream.prototype.cycle = function() {
	return Stream.repeat(this).chain(identity);
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
	return new Stream(identity, two(this, s)).chain(identity);
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
		return next(stepper, s.state).then(function(i) {
			if(i.done) {
				return i;
			}

			var value = f(s.value, i.value);
			return new Yield(value, new Pair(value, i.state));
		});
	}, new Pair(initial, this.state));
};

/**
 * Reduce this stream to produce a single result.  Note that reducing an infinite
 * stream will return a Promise that never fulfills, but that may reject if an error
 * occurs.
 * @param {function(result:*, x:*):*} f reducer function
 * @param {*} initial initial value
 * @returns {Promise} promise for the file result of the reduce
 */
Stream.prototype.reduce = function(f, initial) {
	return reduce(f, initial, this.step, this.state);
};

function reduce(f, z, stepper, state) {
	return next(stepper, state).then(function(i) {
			return i.done ? z
				: reduce(f, f(z, i.value), stepper, i.state);
		}
	);
}

// Helpers

function next(stepper, state) {
	return Promise.resolve(state).then(stepper).then(function(i) {
		return i.skip ? next(stepper, i.state) : i;
	});
}

function streamNext(s) {
	return next(s.step, s.state);
}

function getValueOrFail(s) {
	if(s.done) {
		throw new Error('empty stream');
	}
	return s.value;
}

function getState(s) {
	return s.state;
}

function one(x) {
	return new Yield(x, new End());
}

function two(x, y) {
	return new Yield(x, new Yield(y, new End()));
}

function repeat(x) {
	return new Yield(x, x);
}

function Pair(x, s) {
	this.value = x; this.state = s;
}

function yieldPair(step, x) {
	return new Yield(step.value, new Pair(x, step.state));
}

function skipPair(step, x) {
	return new Skip(new Pair(x, step.state));
}

function Outer(f, outer) {
	this.f = f; this.outer = outer; this.inner = void 0;
}

function Inner(f, outer, inner) {
	this.f = f; this.outer = outer; this.inner = inner;
}

function identity(x) {
	return x;
}

function same(a, b) {
	return a === b;
}

function ensureScheduler(scheduler) {
	if(typeof scheduler === 'undefined') {
		return Scheduler.getDefault();
	}
	return scheduler;
}
