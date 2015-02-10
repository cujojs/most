/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var fromArray = require('./fromArray').fromArray;
var isIterable = require('../iterable').isIterable;
var fromIterable = require('./fromIterable').fromIterable;

exports.from = from;

function from(a) {
	if(Array.isArray(a)) {
		return fromArray(a);
	}

	if(isIterable(a)) {
		return fromIterable(a);
	}

	throw new TypeError('not iterable: ' + a);
}