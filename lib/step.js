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

/**
 * A step that yields a new value and a new state that can be used to produce
 * another step
 * @param {*} x value
 * @param {*} s new state
 * @constructor
 */
function Yield(t, x, s) {
	this.time = t; this.done = false; this.value = x; this.state = s;
}

Yield.prototype.map = function(f) {
	return new Yield(this.time, f(this.value), this.state);
};

Yield.prototype.delay = function(dt) {
	return new Yield(this.time + dt, this.value, this.state);
};

Yield.prototype.at = function(t) {
	return new Yield(t, this.value, this.state);
};

/**
 * A step that represents end of stream. The optional value is *not* in the stream,
 * but rather a custom end of end of stream marker value.
 * @param {?*} x optional end signal value
 * @constructor
 */
function End(t, x) {
	this.time = t; this.done = true; this.value = x; this.state = this;
}

End.prototype.map = function() {
	return this;
};

End.prototype.delay = function(dt) {
	return new End(this.time + dt, this.value);
};

End.prototype.at = function(t) {
	return new End(t, this.value);
};

function isDone(step) {
	return step.done;
}

function getValue(step) {
	return step.value;
}

function getValueOrFail(step) {
	if(step.done) {
		throw new Error('no more items');
	}
	return step.value;
}

function getState(step) {
	return step.state;
}

/**
 * A simple value, state pair
 * @param {*} x
 * @param {*} s
 * @constructor
 */
function Pair(x, s) {
	this.value = x; this.state = s;
}

function yieldPair(step, x) {
	return new Yield(step.time, step.value, new Pair(x, step.state));
}
