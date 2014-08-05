/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var promise = require('./promises');
var step = require('./step');

var Promise = promise.Promise;
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
	this._ended = false;
}

Queue.prototype.iterator = function() {
	return new QueueIterator(this);
};

Queue.prototype.add = function(x) {
	checkEnd(this._ended);

	var iteration = new Yield(x);
	if (this._awaiting.length === 0) {
		this._items = this._bufferPolicy(iteration, this._items);
	} else {
		this._awaiting.shift().resolve(iteration);
	}
};

Queue.prototype.end = function(x) {
	checkEnd(this._ended);

	this._ended = true;
	var end = new End(x);
	if(this._awaiting.length > 0) {
		this._awaiting.reduce(resolveAll, end);
	} else {
		this._items.push(end);
	}
};

function QueueIterator(q) {
	this.q = q;
}

QueueIterator.prototype.next = function() {
	var q = this.q;
	if (q._items.length > 0) {
		return q._items.shift();
	}

	if (q._ended) {
		return Promise.reject(new Error('closed'));
	}

	var consumer = defer();
	q._awaiting.push(consumer);
	return consumer.promise;
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