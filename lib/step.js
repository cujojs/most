/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

/** @typedef {Yield|End} Step */

var promise = require('./promises');

var raceIndex = promise.raceIndex;
var getStatus = promise.getStatus;

exports.Yield = Yield;
exports.End   = End;

exports.isDone = isDone;
exports.getValue = getValue;
exports.getValueOrFail = getValueOrFail;
exports.getState = getState;

exports.Pair = Pair;
exports.yieldPair = yieldPair;

exports.unamb = unamb;

/**
 * A step that yields a new value and a new state that can be used to produce
 * another step
 * @param {Number} t time the value became or will become available
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

Yield.prototype.withState = function(state) {
	return new Yield(this.time, this.value, state);
};

/**
 * A step that represents end of stream. The optional value is *not* in the stream,
 * but rather a custom end of end of stream marker value.
 * @param {Number} t end time
 * @param {?*} x optional end signal value
 * @param {*} s end state
 * @constructor
 */
function End(t, x, s) {
	this.time = t; this.done = true; this.value = x; this.state = s;
}

End.prototype.map = function() {
	return this;
};

End.prototype.delay = function(dt) {
	return new End(this.time + dt, this.value, this.state);
};

End.prototype.withState = function(state) {
	return new End(this.time, this.value, state);
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
 * Unambiguously decide which step is the earliest, and call f with
 *  that step and its index in the steps array.
 * This is a more precise race than Promise.race.  Promise.race always
 *  returns the settled promise with the lowest array index, even if a
 *  promise with a higher array index actually won the race.
 *  unamb checks all indices to find the step with the earliest time.
 * @param {function(x:*, i:Number):*} f function to apply to earliest
 *  step and its index
 * @param {Array} steps
 * @returns {Promise} promise for the result of applying f
 */
function unamb(f, steps) {
	var winner = decide(steps);
	if(winner === null) {
		return raceIndex(function(winner, index) {
			return decideWith(f, steps, winner, index);
		}, steps);
	}

	return f(winner.value, winner.index);
}

function decideWith(f, steps, maybeWinner, index) {
	var winner = decide(steps);
	return winner === null ? f(maybeWinner, index)
		 : f(winner.value, winner.index);
}

function decide(steps) {
	var index = -1, t = Infinity, i = 0;
	var winner, h;

	for(; i<steps.length; ++i) {
		h = getStatus(steps[i]);
		if(h.state() > 0 && h.value.time < t) {
			index = i;
			winner = h.value;
			t = winner.time;
		}
	}

	return index < 0 ? null : { index: index, value: winner };
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
