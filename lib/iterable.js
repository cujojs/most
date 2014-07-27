/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Promise = require('./promises').Promise;
var step = require('./step');

var Yield = step.Yield;
var End   = step.End;

exports.from = from;
exports.head = head;

function from(x) {
	/*jshint maxcomplexity:6*/
	if(Array.isArray(x)) {
		return new ArrayIterable(x);
	}

	if(x != null) {
		if(typeof x !== 'function' && typeof x.length === 'number') {
			return new ArrayIterable(x);
		}

		if(typeof x.iterator === 'function') {
			return x;
		}

		if(typeof x.next === 'function') {
			return new IterableWrapper(x);
		}
	}

	throw new TypeError('not iterable: ' + x);
}

function head(iterable) {
	var iterator = iterable.iterator();
	var iteration = iterator.next();
	return Promise.resolve(iteration).then(function(iteration) {
		return iteration.done ? iteration
			: new Yield(iteration.value, new IterableWrapper(iterator));
	});
}

function IterableWrapper(iterator) {
	this._iterator = iterator;
}

IterableWrapper.prototype.iterator = function() {
	return this._iterator;
};

function ArrayIterable(array) {
	this.array = array;
}

ArrayIterable.prototype.iterator = function() {
	return new ArrayIterator(this.array);
};

function ArrayIterator(array) {
	this.array = array;
	this.index = 0;
}

ArrayIterator.prototype.next = function() {
	return this.index < this.array.length
		? new Yield(this.array[this.index++])
		: new End();
};
