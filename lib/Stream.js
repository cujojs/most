/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var compile = require('./fusion/compile');

module.exports = Stream;

function Stream(source) {
	this.source = compile(source);
}
