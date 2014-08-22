/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var promise = require('./promises');
var step = require('./step');

var resolve = promise.Promise.resolve;
var when = promise.when;

var Yield = step.Yield;
var End   = step.End;

exports.from = from;
exports.head = head;
exports.makeIterable = makeIterable;
exports.getIterator = getIterator;

/*global Set, Symbol*/
var iteratorSymbol;
// Firefox ships a partial implementation using the name @@iterator.
// https://bugzilla.mozilla.org/show_bug.cgi?id=907077#c14
if (typeof Set === 'function' && typeof new Set()['@@iterator'] === 'function') {
	iteratorSymbol = '@@iterator';
} else {
	iteratorSymbol = typeof Symbol === 'function' && Symbol.iterator ||
		'_es6shim_iterator_';
}

function makeIterable(makeIterator, obj) {
	obj[iteratorSymbol] = makeIterator;
}

function isIterable(o) {
	return typeof o[iteratorSymbol] === 'function';
}

function getIterator(o) {
	return o[iteratorSymbol]();
}

function from(scheduler, x) {
	/*jshint maxcomplexity:6*/
	if(Array.isArray(x)) {
		return new ArrayIterable(scheduler.now, x);
	}

	if(x != null) {
		if(typeof x !== 'function' && typeof x.length === 'number') {
			return new ArrayIterable(scheduler.now, x);
		}

		if(isIterable(x)) {
			return new IterableAdapter(scheduler.now, x);
		}

		if(typeof x.next === 'function') {
			return new IterableWrapper(new IteratorAdapter(scheduler.now(), x));
		}
	}

	throw new TypeError('not iterable: ' + x);
}

function head(iterable) {
	var iterator = getIterator(iterable);
	var iteration = iterator.next();
	return resolve(iteration).then(function(iteration) {
		return iteration.done ? iteration
			: new Yield(iteration.time, iteration.value, new IterableWrapper(iterator));
	});
}

function IterableAdapter(now, iterable) {
	this.now = now;
	this.iterable = iterable;
}

makeIterable(function() {
	return new IteratorAdapter(this.now(), getIterator(this.iterable));
}, IterableAdapter.prototype);

function IteratorAdapter(time, iterator) {
	this.time = time;
	this._iterator = iterator;
}

IteratorAdapter.prototype.next = function() {
	var time = this.time;
	return when(function(i) {
		return i.done ? new End(time, i.value)
			: new Yield(time, i.value, this);
	}, this._iterator.next());
};

function IterableWrapper(iterator) {
	this._iterator = iterator;
}

makeIterable(function() {
	return this._iterator;
}, IterableWrapper.prototype);

function ArrayIterable(now, array) {
	this.now = now;
	this.array = array;
}

makeIterable(function() {
	return new ArrayIterator(this.now(), this.array);
}, ArrayIterable.prototype);

function ArrayIterator(time, array) {
	this.time = time;
	this.array = array;
	this.index = 0;
}

ArrayIterator.prototype.next = function() {
	return this.index < this.array.length
		? new Yield(this.time, this.array[this.index++], this)
		: new End(this.time, void 0);
};
