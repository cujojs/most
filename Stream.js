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

		end && end(error);
	});
}

function empty() {
	return new Stream(function(next, end) {
		end();
	});
}

var proto = Stream.prototype = {};

proto.constructor = Stream;

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
		return stream2.map(function(x) {
			return f(x);
		});
	});
};

proto.flatMap = function(f) {
	return join(this.map(f));
}

function join(self) {
	return new Stream(function(next, end) {
		self.each(function(inner) {
			inner.each(next, end);
		}, end);
	});
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
	var self = this;
	return new Stream(function(next, end) {
		self.each(next, end);
		other.each(next, end);
	});
};

proto.concat = function(other) {
	// TODO: Should this accept an array?  a stream of streams?
	var self = this;
	return new Stream(function(next, end) {
		self.each(next, function(e) {
			e ? (end && end(e)) : other.each(next, end);
		});
	});
}

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

proto.catch = function(f) {
	var stream = this._emitter;
	return new Stream(function(next, end) {
		stream(next, function(e1) {
			var error;
			if(e1) {
				try {
					next(f(e1));
				} catch(e2) {
					error = e2;
				}
			}

			if(error) {
				end && end(error);
			}
		});
	});
};

proto.each = function(next, end) {
	this._emitter(next, end);
};

proto.reduce = function(f, initial) {
	var stream = this._emitter;
	return new Stream(function(next, end) {
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
	});
};

proto.scan = function(f, initial) {
	return this.map(function(x) {
		return initial = f(initial, x);
	});
};
