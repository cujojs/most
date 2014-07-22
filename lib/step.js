/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

exports.Yield = Yield;
exports.End   = End;

function Yield(x, s) {
	this.done = false; this.value = x; this.state = s;
}

function End(x) {
	this.done = true; this.value = x; this.state = this;
}
