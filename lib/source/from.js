/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var fromArray = require('./fromArray').fromArray;
var isIterable = require('../iterable').isIterable;
var fromIterable = require('./fromIterable').fromIterable;
var isArrayLike = require('../base').isArrayLike;
var observable = require('../observable');

var isObservable = observable.isObservable;
var fromObservable = observable.fromObservable;

exports.from = from;

function from(a) {
	if(Array.isArray(a) || isArrayLike(a)) {
		return fromArray(a);
	}

	if(isObservable(a)) {
		return fromObservable(a);
	}

	if(isIterable(a)) {
		return fromIterable(a);
	}

	throw new TypeError('not coercible: ' + a);
}
