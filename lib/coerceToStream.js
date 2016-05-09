/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('./Stream');
var getObservable = require('./observable/getObservable');
var fromObservable = require('./observable/fromObservable').fromObservable;

module.exports = coerceToStream;

function coerceToStream(x) {
	if (x instanceof Stream) {
		return x;
	}

	var observable = getObservable(x);
	if(observable != null) {
		return fromObservable(observable);
	}

	throw new TypeError('must be most Stream or observable ' + x);
}
