/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var resolve = require('./Promise').resolve;

// TODO
// -  zip

module.exports = Stream;

function Stream(source) {
	this.source = source;
}
