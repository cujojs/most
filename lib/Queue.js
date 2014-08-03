/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var promise = require('./promises');
var step = require('./step');
var makeIterable = require('./iterable').makeIterable;

var reject = promise.Promise.reject;
var defer = promise.defer;

var Yield = step.Yield;
var End   = step.End;

module.exports = Queue;

Queue.keepAll = keepAll;
Queue.keepNewest = keepNewest;
Queue.keepOldest = keepOldest;

/**
 * An asynchronous queue that manages speed differences between producers
 * and consumers.  When the consumer is faster than the producer, the queue
 * returns a promise for the next iteration, which the consumer must wait for
 * before pulling subsequent iterations.  When the producer is faster, items
 * are buffered according to the supplied bufferPolicy.
 * @param {function(s:Step, items:Array):Array=keepAll} bufferPolicy queue buffering
 *  policy that will be used to manage consumer queue sizes. Defaults to keepAll,
 *  which allows queues to grow forever.
 * @constructor
 */
function Queue(bufferPolicy) {
	this._bufferPolicy = typeof bufferPolicy !== 'function' ? keepAll : bufferPolicy;

	this._items = [];
	this._awaiting = [];
	this._ended = defer();
	this.ended = this._ended.promise;
	this.isEnded = false;
}

Queue.disposeQueue = disposeQueue;

function disposeQueue(t, x, queue) {
	return queue.end(t, x);
}

makeIterable(function() {
	return new QueueIterator(this);
}, Queue.prototype);

Queue.prototype.add = function(t, x) {
	if (this.isEnded) {
		throw new Error('Queue ended');
	}

	var iteration = new Yield(t, x, this);
	if (this._awaiting.length === 0) {
		this._items = this._bufferPolicy(iteration, this._items);
	} else {
		this._awaiting.shift().resolve(iteration);
	}
};

Queue.prototype.error = function(e) {
	if(this.isEnded) {
		return;
	}

	this.isEnded = true;

	this._ended.reject(e);
	if(this._awaiting.length > 0) {
		this._awaiting.reduce(resolveAll, this._ended.promise);
	} else {
		this._items.push(this._ended.promise);
	}
};

Queue.prototype.end = function(t, x) {
	if(this.isEnded) {
		return;
	}

	this.isEnded = true;
	var end = new End(t, x, this);
	if(this._awaiting.length > 0) {
		this._awaiting.reduce(resolveAll, end);
	} else {
		this._items.push(end);
	}

	this._ended.resolve(this);
};

Queue.prototype.get = function() {
	if (this._items.length > 0) {
		return this._items.shift();
	}

	if (this.isEnded) {
		return reject(new Error('Queue ended'));
	}

	var consumer = defer();
	this._awaiting.push(consumer);
	return consumer.promise;
};

function QueueIterator(q) {
	this.queue = q;
}

QueueIterator.prototype.next = function() {
	return this.queue.get();
};

function resolveAll(end, consumer) {
	consumer.resolve(end);
	return end;
}

function keepAll(x, items) {
	items.push(x);
	return items;
}

function keepNewest(n) {
	return function(x, items) {
		return items.length < n ? keepAll(x, items) : keepAll(x, items.slice(1, n));
	};
}

function keepOldest(n) {
	return function(x, items) {
		return items.length < n ? keepAll(x, items) : items;
	};
}
