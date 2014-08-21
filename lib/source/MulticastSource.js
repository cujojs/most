/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Queue = require('../Queue');
var iterable = require('../iterable');

var getIterator = iterable.getIterator;

module.exports = MulticastSource;

/**
 * Event source that allows multiple consumers to share a single subscription
 * to an imperatively generated stream.
 * @param {Scheduler} scheduler
 * @param {function(add:function(x), end:function(e)):function} run function
 *  that will receive 2 functions as arguments, the first to add new values to the
 *  stream and the second to end the stream. It may *return* a function that
 *  will be called once all consumers have stopped observing the stream.
 * @param {function(s:Step, items:Array):Array} defaultBufferPolicy queue buffering
 *  policy that will be used to manage consumer queue sizes
 * @constructor
 */
function MulticastSource(scheduler, run, defaultBufferPolicy) {
	this.scheduler = scheduler;

	this._run = run;
	this._subscribers = void 0;
	this._defaultBufferPolicy = defaultBufferPolicy;
	this._dispose = noop;

	var self = this;
	this._doPublishNext = function(x) {
		return self._publishNext(x);
	};
	this._doEnd = function(e) {
		return self._end(e);
	};
	this._doRemove = function(q) {
		return self._remove(q);
	};
}

iterable.makeIterable(function(bufferPolicy) {
	var q = new Queue(bufferPolicy || this._defaultBufferPolicy);

	q.ended.then(this._doRemove);

	if(this._subscribers === void 0) {
		this._subscribers = [q];
		this._dispose = this._run.call(void 0, this._doPublishNext, this._doEnd);
	} else {
		this._subscribers.push(q);
	}

	return getIterator(q);
}, MulticastSource.prototype);

MulticastSource.prototype._remove = function(subscriber) {
	this._subscribers.splice(this._subscribers.indexOf(subscriber), 1);

	var dispose = this._dispose;
	this._dispose = noop;
	if(this._subscribers.length === 0 && typeof dispose === 'function') {
		dispose();
	}
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

	while(s.length > 0) {
		s.shift().end(t, x);
	}
};

function noop() {}