/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var events = require('./events');
var promise = require('./promises');
var base = require('./base');

var when = promise.when;
var raceIndex = promise.raceIndex;
var getStatus = promise.getStatus;

var Yield = events.Yield;
var End   = events.End;

exports.newYield = newYield;
exports.newEnd = newEnd;
exports.step = step;
exports.never = never;
exports.map = map;
exports.flatMap = flatMap;
exports.mapEvent = mapEvent;
exports.delayEvent = delayEvent;
exports.putState = putState;
exports.getEvent = getEvent;

exports.unamb = unamb;

function Step(event, state) {
	this.event = event;
	this.state = state;
}

function newYield(t, x, state) {
	return new Step(new Yield(t, x), state);
}

function newEnd(t, x, state) {
	return new Step(new End(t, x), state);
}

function step(event, state) {
	return new Step(event, state);
}

function never() {
	return new Step(promise.never());
}

function map(f, step) {
	return when(function(step) {
		return doMap(f, step);
	}, step);
}

function doMap(f, step) {
	return new Step(when(f, step.event), step.state);
}

function flatMap(f, step) {
	return when(function(step) {
		return doFlatMap(f, step);
	}, step);
}

function doFlatMap(f, step) {
	return when(function(event) {
		return f(event, step);
	}, step.event);
}

function mapEvent(f, step) {
	return when(function(step) {
		return doMapEvent(f, step);
	}, step);
}

function doMapEvent(f, step) {
	var event = when(function(event) {
		return event.map(f);
	}, step.event);

	return new Step(event, step.state);
}

function delayEvent(dt, step) {
	return when(function(step) {
		return doDelayEvent(dt, step);
	}, step);
}

function doDelayEvent(dt, step) {
	var event = when(function(event) {
		return event.delay(dt);
	}, step.event);

	return new Step(event, step.state);
}

function putState(state, step) {
	return when(function(step) {
		return new Step(step.event, state);
	}, step);
}

function getEvent(step) {
	return step.event;
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
		return raceIndex(function() {
			return raceIndex(function(winner, index) {
				return decideWith(f, steps, winner, index);
			}, base.map(getEvent, steps));
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
	var winner, sh, eh, e;

	for(; i<steps.length; ++i) {
		sh = getStatus(steps[i]);
		if(sh.state() > 0) {
			eh = getStatus(sh.value.event);
			if(eh.state() > 0 && eh.value.time < t) {
				index = i;
				winner = sh.value;
				e = eh.value;
				t = e.time;
			}
		}
	}

	return index < 0 ? null : { index: index, value: step(e, winner.state) };
}