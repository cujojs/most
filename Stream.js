/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Brian Cavalier
 * @author: John Hann
 */

module.exports = Stream;

Stream.of = of;
Stream.empty = empty;

function Stream(emitter) {
	this._emitter = emitter;
}

function of(x) {
	return new Stream(function(next, end) {
		var error;
		try {
			next(x);
		} catch(e) {
			error = e;
		}

		streamEnd(end, error);
	});
}

function empty() {
	return new Stream(function(next, end) {
		end();
	});
}

var proto = Stream.prototype = {};

proto.constructor = Stream;

proto.end = function() {
	this.ended = true;
};

proto.each = function(next, end) {
	var self = this;
	var endCalled;

	function safeNext(x) {
		self.ended || (next && next(x));
	}

	function safeEnd(e) {
		if(endCalled) {
			return;
		}

		endCalled = true;
		streamEnd(end, e);
	}

	this._emitter(safeNext, safeEnd);
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
			f(x).each(next, end);
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
		other.each(next, end);
	});
};

proto.concat = function(other) {
	// TODO: Should this accept an array?  a stream of streams?
	var stream = this._emitter;
	return new Stream(function(next, end) {
		stream(next, function(e) {
			e ? streamEnd(end, e) : other.each(next, end);
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
				streamEnd(end, error);
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
			streamEnd(end, e);
		});
	});
};

proto.scan = function(f, initial) {
	return this.map(function(x) {
		return initial = f(initial, x);
	});
};

function streamEnd(end, e) {
	return end && end(e);
}

function identity(x) {
	return x;
}