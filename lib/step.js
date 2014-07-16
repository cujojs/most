/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

exports.Yield = Yield;
exports.Skip  = Skip;
exports.End   = End;

function Yield(x, s) {
	this.done = false; this.skip = false; this.value = x; this.state = s;
}

function Skip(s) {
	this.done = false; this.skip = true; this.value = void 0; this.state = s;
}

function End(x) {
	this.done = true; this.skip = false; this.value = x; this.state = void 0;
}
