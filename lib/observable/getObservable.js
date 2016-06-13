/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var symbolObservable = require('symbol-observable');

module.exports = getObservable;

function getObservable(o) {
	var obs = null;
	if(o && typeof o[symbolObservable] === 'function') {
		obs = o[symbolObservable]();
		if(!(obs && typeof obs.subscribe === 'function')) {
			throw new TypeError('invalid observable ' + obs);
		}
	}

	return obs;
}
