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
 * are buffered.
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

makeIterable(function() {
	return new QueueIterator(this);
}, Queue.prototype);

Queue.prototype.add = function(t, x) {
	checkEnd(this.isEnded);

	var iteration = new Yield(t, x, this);
	if (this._awaiting.length === 0) {
		this._items = this._bufferPolicy(iteration, this._items);
	} else {
		this._awaiting.shift().resolve(iteration);
	}
};

Queue.prototype.end = function(t, x) {
	checkEnd(this.isEnded);

	this.isEnded = true;
	var end = new End(t, x);
	if(this._awaiting.length > 0) {
		this._awaiting.reduce(resolveAll, end);
	} else {
		this._items.push(end);
	}

	this._ended.resolve(x);
};

Queue.prototype.get = function() {
	if (this._items.length > 0) {
		return this._items.shift();
	}

	if (this.isEnded) {
		return reject(new Error('closed'));
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

function checkEnd(closed) {
	if(closed) {
		throw new Error('Queue end');
	}
}

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