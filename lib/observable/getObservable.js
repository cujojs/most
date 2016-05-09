/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var symbolObservable = require('symbol-observable');

module.exports = getObservable;

function getObservable(o) {
	var obs = null;
	if(typeof o === 'object' && o != null) {
		var method = o[symbolObservable];
		if(typeof method === 'function') {
			obs = method.call(o);
			if(obs == null || typeof obs !== 'object') {
				throw new TypeError('invalid observable ' + obs);
			}
		}
	}

	return obs;
}
