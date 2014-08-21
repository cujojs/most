/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Queue = require('../Queue');
var iterable = require('../iterable');

var getIterator = iterable.getIterator;

module.exports = MulticastSource;

function MulticastSource(scheduler, run, defaultBufferPolicy) {
	this._run = run;
	this._subscribers = void 0;
	this._defaultBufferPolicy = defaultBufferPolicy;
	this._dispose = noop;

	this.scheduler = scheduler;
}

iterable.makeIterable(function(bufferPolicy) {
	var q = new Queue(bufferPolicy || this._defaultBufferPolicy);

	var self = this;
	q.ended.then(function() {
		self._remove(q);
	});

	if(this._subscribers === void 0) {
		this._subscribers = [q];
		this._dispose = this._start();
	} else {
		this._subscribers.push(q);
	}

	return getIterator(q);
}, MulticastSource.prototype);

MulticastSource.prototype._remove = function(subscriber) {
	this._subscribers.splice(this._subscribers.indexOf(subscriber), 1);

	if(this._subscribers.length === 0) {
		this._dispose();
	}
};

MulticastSource.prototype._start = function() {
	var self = this;

	return this._run(function(x) {
		return self._publishNext(x);
	}, function(e) {
		return self._end(e);
	});
};

MulticastSource.prototype._publishNext = function(x) {
	var t = this.scheduler.now();

	for(var i=0, s=this._subscribers, l=s.length; i<l; ++i) {
		s[i].add(t, x);
	}
};

MulticastSource.prototype._end = function(x) {
	var t = this.scheduler.now();
	var s = this._subscribers;

	for(var i=0, l=s.length; i<l; ++i) {
		s[i].end(t, x);
	}
};

function noop() {}