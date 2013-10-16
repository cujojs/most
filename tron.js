// TODO: take, takeWhile, takeUntil, drop, dropWhile, takeUntil
// TODO: streams from iterable/iterator/generator
// TODO: move delay?

exports.create = create;
exports.of = of;
exports.empty = empty;

exports.fromArray = fromArray;
exports.fromItem = fromItems;
exports.fromEventTarget = fromEventTarget;
exports.fromPromise = fromPromise;

var methods = [map, ap, flatMap, filter, reduce, scan, merge, concat, tap, delay];

function Stream(emitter) {
	this._emitter = emitter;
}

Stream.prototype = methods.reduce(function(proto, f) {
	proto[f.name] = function() {
		var args = Array.prototype.slice.call(arguments);
		args.unshift(this._emitter);
		return new Stream(f.apply(void 0, args));
	};

	return proto;
}, {});

Stream.prototype.read = function(next, end) {
	this._emitter(next, end);
};

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

function of(x) {
	return function(next, end) {
		var error;
		try {
			next(x);
		} catch(e) {
			error = e;
		}

		end && end(error);
	};
}

function empty() {
	return function(next, end) {
		end();
	}
}

function ap(stream1, stream2) {
	return function(next, end) {
		stream1(function(f) {
			stream2(function(x) {
				next(f(x));
			});
		}, end);
	}
}

function map(stream, f) {
	return function(next, end) {
		stream(function(x) {
			next(f(x));
		}, end);
	};
}

function flatMap(stream, f) {
	return join(map(stream, f));
}

function join(stream) {
	return function(next, end) {
		stream(function(resultStream) {
			resultStream.read(next);
		}, end);
	}
}

function merge(stream1, stream2) {
	// TODO: Should this accept an array?  a stream of streams?
	return function(next, end) {
		stream1(next, end);
		stream2(next, end);
	}
}

function filter(stream, predicate) {
	return function(next, end) {
		stream(function(x) {
			predicate(x) && next(x);
		}, end);
	};
}

function concat(stream1, stream2) {
	// TODO: Should this accept an array?  a stream of streams?
	return function(next, end) {
		stream1(next, function(e) {
			e ? end(e) : stream2(next, end);
		});
	}
}

function tap(stream, f) {
	return function(next, end) {
		stream(function(x) {
			f(x);
			next(x);
		}, end);
	}
}

function delay(stream, ms) {
	return function(next, end) {
		stream(function(x) {
			setTimeout(function() {
				next(x);
			}, ms);
		}, end);
	};
}

function reduce(stream, f, initial) {
	return function(next, end) {
		var value = initial;
		stream(function(x) {
			value = f(value, x);
		}, function(e) {
			if(e) {
				end && end(e);
			} else {
				next(value);
				end && end();
			}
		});
	}
}

function scan(stream, f, initial) {
	return map(stream, function(x) {
		return initial = f(initial, x);
	});
}
