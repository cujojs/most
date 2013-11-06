/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Brian Cavalier
 * @author: John Hann
 */

var async = require('./async');

module.exports = Stream;

Stream.of = of;
Stream.empty = empty;

function Stream(emitter) {
	this._emitter = emitter;
}

function of(x) {
	return new Stream(function (next, end) {
		try {
			next(x);
			end();
		} catch (e) {
			end(e);
		}

		return noop;
	});
}

function empty() {
	return new Stream(emptyEmitter);
}

var proto = Stream.prototype = {};

proto.constructor = Stream;

/**
 * Start consuming items in the stream.
 * @param {function} next called once for each item in the stream
 * @param {function?} end called once when either:
 *  1. the stream is ended, that is, when it has no more items, *or*
 *  2. when a fatal error has occurred in the stream. In this case, the error
 *     will be passed to end.
 *  In either case, neither next nor end will ever be called again.
 *  If end is not provided, and an error occurs, it will be rethrown to the host
 *  environment.
 * @returns {function} function to unsubscribe from the stream. After calling
 *  this, next and end will never be called again.
 */
proto.each = function(next, end) {
	var done, unsubscribe, self = this;

	if(typeof end !== 'function') {
		end = fatal;
	}

	async(function() {
		unsubscribe = self._emitter(safeNext, safeEnd);
	});

	function safeUnsubscribe() {
		if(done) {
			return;
		}

		done = true;

		if(typeof unsubscribe === 'function') {
			unsubscribe();
		} else {
			async(function() {
				unsubscribe();
			});
		}
	}

	function safeNext(x) {
		if(done) {
			return;
		}
		next(x);
	}

	function safeEnd(e) {
		if(done) {
			return;
		}
		done = true;
		end.apply(void 0, arguments);
	}

	return safeUnsubscribe;
};

proto.map = function(f) {
	var stream = this._emitter;
	return new Stream(function(next, end) {
		stream(function(x) {
			next(f(x));
		}, end);
	});
};

proto.ap = function(stream2) {
	return this.flatMap(function(f) {
		return stream2.map(f);
	});
};

proto.flatMap = function(f) {
	var stream = this._emitter;
	return new Stream(function(next, end) {
		stream(function(x) {
			f(x)._emitter(next, end);
		}, end);
	});
};

proto.flatten = function() {
	return this.flatMap(identity);
};

proto.filter = function(predicate) {
	var stream = this._emitter;
	return new Stream(function(next, end) {
		stream(function(x) {
			predicate(x) && next(x);
		}, end);
	});
};

proto.merge = function(other) {
	// TODO: Should this accept an array?  a stream of streams?
	var stream = this._emitter;
	return new Stream(function(next, end) {
		stream(next, end);
		other._emitter(next, end);
	});
};

proto.concat = function(other) {
	// TODO: Should this accept an array?  a stream of streams?
	var stream = this._emitter;
	return new Stream(function(next, end) {
		stream(next, function(e) {
			e ? end(e) : other._emitter(next, end);
		});
	});
};

proto.tap = function(f) {
	var stream = this._emitter;
	return new Stream(function(next, end) {
		stream(function(x) {
			f(x);
			next(x);
		}, end);
	});
};

proto.buffer = function(windower) {
	var stream = this._emitter;
	return new Stream(function(next, end) {
		var buffer;
		stream(function(x) {
			buffer = windower(next, x, buffer||[]);
		}, end);
	});
};

proto.bufferCount = function(n) {
	return this.buffer(createCountBuffer(n));
};

proto.bufferTime = function(interval) {
	return this.buffer(createTimeBuffer(interval));
};

proto.delay = function(ms) {
	var stream = this._emitter;
	return new Stream(function(next, end) {
		stream(function(x) {
			setTimeout(function() {
				next(x);
			}, ms||0);
		}, end);
	});
};

proto.debounce = function(interval) {
	var nextEventTime = interval;
	var stream = this._emitter;

	return new Stream(function(next, end) {
		stream(function(x) {
			var now = Date.now();
			if(now >= nextEventTime) {
				nextEventTime = now + interval;
				next(x);
			}
		}, end);
	});
};

proto.throttle = function(interval) {
	var cachedEvent, throttled;
	var stream = this._emitter;

	return new Stream(function(next, end) {
		stream(function(x) {
			cachedEvent = x;

			if(!throttled) {
				throttled = setTimeout(function() {
					throttled = void 0;
					next(x);
				}, interval);
			}
		}, end);
	});
};

proto['catch'] = function(f) {
	var stream = this._emitter;
	return new Stream(function(next, end) {
		stream(next, function(e1) {
			var error;
			if(e1 != null) {
				try {
					next(f(e1));
				} catch(e2) {
					error = e2;
				}
			}

			if(error != null) {
				end(error);
			}
		});
	});
};

proto.reduce = function(f, initial) {
	var stream = this._emitter;
	return new Stream(function(next, end) {
		var value = initial;
		stream(function(x) {
			value = f(value, x);
		}, function(e) {
			if(e == null) {
				next(value);
			}

			end(e);
		});
	});
};

proto.scan = function(f, initial) {
	return this.map(function(x) {
		return initial = f(initial, x);
	});
};

function emptyEmitter(_, end) {
	async(end);
}

function createTimeBuffer(interval) {
	var buffered;
	return function(next, x, buffer) {
		if(!buffered) {
			buffered = true;
			buffer = [x];

			setTimeout(function() {
				next(buffer.slice());
				buffered = false;
			}, interval);
		} else {
			buffer.push(x);
		}

		return buffer;
	}
}

function createCountBuffer(n) {
	return function (next, x, buffer) {
		buffer && buffer.push(x) || (buffer = [x]);

		if(buffer.length >= n) {
			next(buffer);
			buffer = void 0;
		}

		return buffer;
	};
}

function fatal(e) {
	if(e != null) {
		throw e;
	}
}

function identity(x) {
	return x;
}

function noop() {}