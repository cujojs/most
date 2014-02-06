var async = require('./async');

module.exports = Promise;

function Promise(resolver) {
	this._fork = resolver;
}

Promise.of = of;
Promise.resolve = resolve;
Promise.reject = reject;

function of(x) {
	return new ResolvedPromise(x);
}

function resolve(x) {
	return x instanceof Promise ? x : of(x);
}

function reject(x) {
	return new RejectedPromise(x);
}

Promise.prototype._resolver = function(resolve, reject) {
	var self = this;

	function _resolve(x) {
		this._value = x;
		self._fork = self._resolved;
		resolve(x);
	}

	function _reject(x) {
		this._value = x;
		self._fork = self._rejected;
		reject(x);
	}

	try {
		this._fork(_resolve, _reject);
	} catch (e) {
		_reject(e);
	}
};

Promise.prototype._resolved = function(resolve) {
	resolve(this._value);
};

Promise.prototype._rejected = function(_, reject) {
	reject(this._value);
};

Promise.prototype.done = function(f, r) {
	var p = this;
	async(function() {
		p._resolver(function(x) {
			if(typeof f === 'function') {
				f(x);
			}
		}, function(e) {
			if(typeof r === 'function') {
				r(e);
			} else {
				throw e;
			}
		});
	});
};

Promise.prototype.map = function(f) {
	var prev = this;
	return new Promise(function(resolve, reject) {
		prev._resolver(function(x) {
			resolve(f(x));
		}, reject);
	});
};

Promise.prototype.flatMap = function(f) {
	var prev = this;
	return new Promise(function(resolve, reject) {
		prev._resolver(function(x) {
			f(x)._resolver(resolve, reject);
		}, reject);
	});
};

Promise.prototype.ap = function(promise) {
	return this.flatMap(function(f) {
		return promise.map(f);
	});
};

Promise.prototype.then = function(f, r) {
	var next = typeof f === 'function' ? this.flatMap(function(x) {
		if(x instanceof Promise) {
			return x.then(f);
		}

		if(Object(x) !== x) {
			return resolve(f(x));
		}

		var then = x.then;
		if(typeof then === 'function') {
			return new Promise(function(resolve, reject) {
				then.call(x, resolve, reject);
			});
		}

		return resolve(f(x));
	}) : this;

	return typeof r === 'function' ? next.catch(r) : next;
};

Promise.prototype.catch = function(f) {
	var prev = this;
	return new Promise(function(resolve) {
		prev._resolver(resolve, function(e) {
			resolve(f(e));
		});
	});
};

function ResolvedPromise(x) {
	this._value = x;
}

ResolvedPromise.prototype = Object.create(Promise.prototype);
ResolvedPromise.prototype._resolver = function(resolve) {
	resolve(this._value);
};

function RejectedPromise(x) {
	this._value = x;
}

RejectedPromise.prototype = Object.create(Promise.prototype);
RejectedPromise.prototype._resolver = function(_, reject) {
	reject(this._value);
};
