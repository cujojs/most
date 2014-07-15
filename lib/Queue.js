/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Promise = require('when/es6-shim/Promise');
var step = require('./step');

module.exports = Queue;

function Queue() {
	this.producers = [];
	this.consumers = [];
	this.closed = false;
}

Queue.prototype.put = function(x) {
	this._enqueueNext(new step.Yield(x));
};

Queue.prototype.iterator = function() {
	return this;
};

Queue.prototype.end = function(x) {
	this._enqueueNext(new step.End(x));
	this.closed = true;
};

Queue.prototype.next = function() {
	if (this.producers.length) {
		return this.producers.shift();

	} else {
		if (this.closed) {
			return Promise.reject(new Error('closed'));
		}

		var consumer = defer();
		this.consumers.push(consumer);
		return consumer.promise;
	}
};

Queue.prototype._enqueueNext = function(iteration) {
	if(this.closed) {
		throw new Error('closed');
	}

	if(this.consumers.length === 0) {
		this.producers.push(iteration);
	} else {
		this.consumers.shift().resolve(iteration);
	}
};

function defer() {
	var d = { promise: void 0, resolve: void 0, reject: void 0 };
	d.promise = new Promise(function(resolve, reject) {
		d.resolve = resolve;
		d.reject = reject;
	});
}
