/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var MulticastSource = require('@most/multicast').MulticastSource;

module.exports = Stream;

function Stream(source) {
	this._source = new MulticastSource(source)
	this.source = source;
}
