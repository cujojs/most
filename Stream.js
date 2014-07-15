/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Promise = require('when/es6-shim/Promise');

var Queue = require('./lib/Queue');
var step = require('./lib/step');
var iterable = require('./lib/iterable');
var iterableFrom = iterable.from;
var iterableHead = iterable.head;

module.exports = Stream;

var Yield = Stream.Yield = step.Yield;
var Skip  = Stream.Skip  = step.Skip;
var End   = Stream.End   = step.End;

function Stream(step, state) {
	this.step = step;
	this.state = state;
}

Stream.empty = function() {
	return new Stream(identity, new End());
};

Stream.of = function(x) {
	return new Stream(identity, once(x));
};

Stream.from = function(iterable) {
	return new Stream(iterableHead, iterableFrom(iterable));
};

Stream.fromPromise = function(p) {
	return new Stream(identity, p.then(once));
};

Stream.unfold = function(f, x) {
	return new Stream(f, x);
};

Stream.iterate = function(f, x) {
	return new Stream(function(x) {
		return new Yield(x, f(x));
	}, x);
};

Stream.repeat = function(x) {
	return new Stream(repeat, x);
};

Stream.produce = function(f) {
	var q = new Queue();

	f(function put(x) {
		q.put(x);
	}, function end(e) {
		q.end(e);
	});

	return Stream.from(q);
};

Stream.prototype.forEach = Stream.prototype.observe = function(f) {
	return runStream(f, this.step, this.state);
};

function runStream(f, stepper, state) {
	return next(stepper, state).then(function(s) {
		if (s.done) {
			return s.value;
		}

		return Promise.resolve(f(s.value)).then(function (x) {
			return x instanceof End ? x.value : runStream(f, stepper, s.state);
		});
	});
}

Stream.prototype.map = function(f) {
	var stepper = this.step;
	return new Stream(function (state) {
		return next(stepper, state).then(function(i) {
			return i.done ? i
				: new Yield(f(i.value), i.state);
		});
	}, this.state);
};

Stream.prototype.tap = function(f) {
	return this.map(function(x) {
		f(x);
		return x;
	});
};

Stream.prototype.ap = function(xs) {
	return this.chain(function(f) {
		return xs.map(f);
	});
};

Stream.prototype.chain = function(f) {
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

Stream.prototype.filter = function(p) {
	var stepper = this.step;
	return new Stream(function(state) {
		return next(stepper, state).then(function(i) {
			return i.done || p(i.value) ? i
				: new Skip(i.state);
		});
	}, this.state);
};

Stream.prototype.distinct = function(eq) {
	if(typeof eq !== 'function') {
		eq = same;
	}

	var stepper = this.step;
	return new Stream(function(s) {
		return next(stepper, s.state).then(function(i) {
			return i.done ? i
				: eq(s.value, i.value) ? new Skip(new Pair(s.value, i.state))
				: new Yield(i.value, new Pair(i.value, i.state));
		});
	}, new Pair({}, this.state));
};

Stream.prototype.head = function() {
	return next(this.step, this.state).then(getValueOrFail);
};

Stream.prototype.tail = function() {
	var state = next(this.step, this.state).then(getState);
	return new Stream(this.step, state);
};

Stream.prototype.takeWhile = function(p) {
	var stepper = this.step;
	return new Stream(function(s) {
		return next(stepper, s).then(function(i) {
			return i.done || p(i.value) ? i
				: new End();
		});
	}, this.state);
};

Stream.prototype.take = function(n) {
	var stepper = this.step;
	return new Stream(function(s) {
		return next(stepper, s.state).then(function(i) {
			return i.done || s.value === 0 ? new End()
				: new Yield(i.value, new Pair(s.value-1, i.state));
		});
	}, new Pair(n, this.state));
};

Stream.prototype.cycle = function() {
	return Stream.repeat(this).chain(identity);
};

Stream.prototype.startWith = function(x) {
	return Stream.of(x).concat(this);
};

Stream.prototype.concat = function(stream) {
	return Stream.from([this, stream]).chain(identity);
};

Stream.prototype.scan = function(f, z) {
	var stepper = this.step;
	return new Stream(function(s) {
		return next(stepper, s.state).then(function(i) {
			if(i.done) {
				return i;
			}

			var value = f(s.value, i.value);
			return new Yield(value, new Pair(value, i.state));
		});
	}, new Pair(z, this.state));
};

Stream.prototype.reduce = function(f, z) {
	return reduce(f, z, this.step, this.state);
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

function once(x) {
	return new Yield(x, new End());
}

function repeat(x) {
	return new Yield(x, x);
}

function Pair(x, s) {
	this.value = x; this.state = s;
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

function Subscribable(observable) {
	this.subscribers = [];

	var self = this;

	observable.observe(function(x) {
		self.subscribers.reduce(function(x, s) {
			s.put(x);
			return x;
		}, x);
	}).done(function(e) {
		self.subscribers.reduce(function(e, s) {
			s.end(e);
			return e;
		}, e);
		self.subscribers = [];
	});
}

Subscribable.prototype.subscribe = function() {
	var q = new Queue();
	this.subscribers.push(q);
	return Stream.from(q);
};
