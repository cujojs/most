/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author Brian Cavalier
 * @author John Hann
 */

var async = require('./async');

module.exports = Stream;

Stream.of = of;
Stream.empty = empty;
Stream.iterate = iterate;
Stream.repeat = repeat;

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

function iterate(f, x) {
	var value = x;
	return new Stream(function(next, end) {
		try {
			next(value) ? async(emitNext) : end();
		} catch(e) {
			end(e)
		}

		function emitNext() {
			try {
				next(value = f(value)) ? async(emitNext) : end();
			} catch(e) {
				end(e);
			}
		}
	});
}

function repeat(x) {
	return iterate(identity, x);
}


var proto = Stream.prototype = {};

proto.constructor = Stream;

/**
 * Start consuming items in the stream.
 * @param {function} next called once for each item in the stream
 * @param {function?} end called once when either:
 *
 *  1. the stream is ended, that is, when it has no more items, *or*
 *  2. when a fatal error has occurred in the stream. In this case, the error
 *     will be passed to end.
 *  In either case, neither next nor end will ever be called again.
 *  If end is not provided, and an error occurs, it will be rethrown to the host
 *  environment.
 * @returns {function} function to unsubscribe from the stream. After calling
 *  this, next and end will never be called again.
 */
proto.forEach = function(next, end) {
	var ended, unsubscribed, unsubscribe, self = this;

	if(typeof end !== 'function') {
		end = fatal;
	}

	async(function() {
		unsubscribe = self._emitter(safeNext, safeEnd);
	});

	function safeUnsubscribe() {
		if(unsubscribed) {
			return;
		}

		unsubscribed = true;

		async(function() {
			if(typeof unsubscribe === 'function') {
				unsubscribe();
			}
		});
	}

	function safeNext(x) {
		if(ended || unsubscribed) {
			return false;
		}
		next(x);

		return true;
	}

	function safeEnd() {
		if(ended) {
			return;
		}
		ended = true;
		safeUnsubscribe();

		end.apply(void 0, arguments);
	}

	return safeUnsubscribe;
};

proto.map = function(f) {
	var stream = this._emitter;
	return new Stream(function(next, end) {
		stream(function(x) {
			return next(f(x));
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
		var cont = true;
		stream(function(x) {
			f(x)._emitter(function(x) {
				return (cont = next(x));
			}, endOnError(end));
			return cont;
		}, end);
	});
};

proto.flatten = function() {
	return this.flatMap(identity);
};

proto.cycle = function() {
	var stream = this._emitter;
	return new Stream(function(next, end) {
		stream(next, handleEnd);
		var cont = true;
		function handleEnd(e) {
			if(e != null) {
				end(e);
			} else {
				(cont === false) ? end() : async(function() {
					stream(function(x) {
						return (cont = next(x));
					}, handleEnd);
				});
			}
		}
	});
};

proto.filter = function(predicate) {
	var stream = this._emitter;
	return new Stream(function(next, end) {
		stream(function(x) {
			if (predicate(x)) {
				return next(x);
			}
		}, end);
	});
};

proto.interleave = function(other) {
	var stream = this._emitter;
	return new Stream(function(next, end) {
		var count = 2;

		stream(next, handleEnd);
		other._emitter(next, handleEnd);

		function handleEnd(e) {
			count -= 1;
			if(e != null) {
				end(e);
			} else if (count === 0) {
				end();
			}
		}
	});
};

proto.intersperse = function(val) {
	var stream = this._emitter;
	return new Stream(function(next, end) {
		stream(function(x) {
			next(x);
			return next(val);
		}, end);
	});
};

proto.zipWith = function(other, f) {
	var stream = this._emitter;
	return new Stream(function(next, end) {
		var buffer1 = [], buffer2 = [], count = 2, cont = true;

		stream(function(x) {
			if(cont) {
				if(buffer2.length > 0) {
					return (cont = next(f(x, buffer2.shift())));
				}
				buffer1.push(x);
			}
			return cont;
		}, handleEnd);
		other._emitter(function(x) {
			if(cont) {
				if(buffer1.length > 0) {
					return (cont = next(f(buffer1.shift(), x)));
				}
				buffer2.push(x);
			}
			return cont;
		}, handleEnd);

		function handleEnd(e) {
			count -= 1;
			if(e != null) {
				cont = false;
				end(e);
			} else if (count === 0) {
				end();
			}
		}
	});
};

proto.zip = function(other) {
	return this.zipWith(other, function(x, y) {
		return [x, y];
	});
};

proto.concat = function(other) {
	// TODO: Should this accept an array?  a stream of streams?
	var stream = this._emitter;
	return new Stream(function(next, end) {
		stream(next, function(e) {
			e == null ? other._emitter(next, end) : end(e);
		});
	});
};

proto.tap = function(f) {
	var stream = this._emitter;
	return new Stream(function(next, end) {
		stream(function(x) {
			f(x);
			return next(x);
		}, end);
	});
};

proto.drop = function(m) {
	var remaining = m;
	return this.dropWhile(function() {
		remaining -= 1;
		return remaining >= 0;
	});
};

proto.dropWhile = function(predicate) {
	var stream = this._emitter;
	return new Stream(function(next, end) {
		stream(function(x) {
			if (predicate !== void 0) {
				if (predicate(x)) {
					return;
				}
				predicate = void 0;
			}
			return next(x);
		}, end);
	});
};

proto.take = function(m) {
	var taken = 0;
	return this.takeWhile(function() {
		taken += 1;
		return taken <= m;
	});
};

proto.takeWhile = function(predicate) {
	var self = this;
	return new Stream(function(next, end) {
		var unsubscribe = self.forEach(function(x) {
			predicate(x) ? next(x) : unsubscribe();
		}, end);
	});
};

proto.buffer = function(windower) {
	var stream = this._emitter;
	return new Stream(function(next, end) {
		var buffer, cont = true;
		stream(function(x) {
			buffer = windower(function(x) {
				cont = next(x);
			}, x, buffer||[]);
			return cont;
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
		var cont = true;
		stream(function(x) {
			setTimeout(function() {
				cont = next(x);
			}, ms||0);
			return cont;
		}, end);
	});
};

proto.debounce = function(interval) {
	var nextEventTime = interval;
	var stream = this._emitter;

	return new Stream(function(next, end) {
		var cont = true;
			stream(function(x) {
			var now = Date.now();
			if(now >= nextEventTime) {
				nextEventTime = now + interval;
				cont = next(x);
			}
			return cont;
		}, end);
	});
};

proto.throttle = function(interval) {
	var cachedEvent, throttled;
	var stream = this._emitter;

	return new Stream(function(next, end) {
		var cont = true;
		stream(function(x) {
			cachedEvent = x;

			if(throttled === void 0) {
				throttled = setTimeout(function() {
					throttled = void 0;
					cont = next(cachedEvent);
				}, interval);
			}
			return cont;
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
			e == null && next(value);

			end(e);
		});
	});
};

proto.reduceRight = function(f, initial) {
	var stream = this._emitter;
	return new Stream(function(next, end) {
		// This is a brute-force approach that uses an array to buffer
		// items, then runs array.reduceRight. Less elegant than recursion,
		// but much faster and more practical in JS.
		var buffer = [];
		stream(function(x) {
			buffer.push(x);
		}, function(e) {
			e == null && next(buffer.reduceRight(f, initial));

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
	end();
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
	};
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

function endOnError(end) {
	return function(e) {
		e == null || end(e);
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
