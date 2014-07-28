/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

/** @typedef {Yield|End} Step */

exports.Yield = Yield;
exports.End   = End;

exports.isDone = isDone;
exports.getValue = getValue;
exports.getValueOrFail = getValueOrFail;
exports.getState = getState;

exports.Pair = Pair;
exports.yieldPair = yieldPair;

function Yield(x, s) {
	this.done = false; this.value = x; this.state = s;
}

Yield.prototype.map = function(f) {
	return new Yield(f(this.value), this.state);
};

function End(x) {
	this.done = true; this.value = x; this.state = this;
}

End.prototype.map = function() {
	return this;
};

function isDone(step) {
	return step.done;
}

function getValue(step) {
	return step.value;
}

function getState(step) {
	return step.state;
}

function getValueOrFail(step) {
	if(step.done) {
		throw new Error('no more items');
	}
	return step.value;
}

function Pair(x, s) {
	this.value = x; this.state = s;
}

function yieldPair(step, x) {
	return new Yield(step.value, new Pair(x, step.state));
}
