var expect = require('buster').expect;
var Stream = require('../../lib/Stream');
var step = require('../../lib/step');
var sync = require('../../lib/combinators/timed').sync;
var observe = require('../../lib/combinators/observe').observe;
var Scheduler = require('../../lib/Scheduler');
var promise = require('../../lib/promises');

var PromiseImpl = promise.Promise;
var resolve = promise.Promise.resolve;

var Yield = step.Yield;
var End = step.End;

exports.assertSame = assertSame;
exports.makeStepsFromTimes = makeStepsFromTimes;
exports.makeStreamFromTimes = makeStreamFromTimes;
exports.createTestScheduler = createTestScheduler;

function assertSame(p1, p2) {
	return new PromiseImpl(function(resolve, reject) {
		observe(function(x) {
			observe(function(y) {
				expect(x).toBe(y);
				resolve();
			}, p2).catch(reject);
		}, p1);
	});
}

function makeStreamFromTimes(times, endTime, scheduler) {
	return sync(new Stream(identity, makeStepsFromTimes(times, endTime), scheduler));
}

function makeStepsFromTimes(times, endTime) {
	return times.reduceRight(function(s, t) {
		return new Yield(t, t, s);
	}, new End(endTime));
}

/**
 * @returns {Scheduler} a scheduler whose clock is externally controllable
 *  via its tick(ticks:Number) method.
 */
function createTestScheduler() {
	var s = new Scheduler(setTimer, clearTimer, now, thrower);

	s._now = 0;

	s.tick = function(ticks, step) {
		if(typeof step !== 'number') {
			step = ticks;
		}

		var s = this;
		var p = resolve();
		for(var i=0; i<ticks; ++i) {
			p = p.then(tickStep);
		}

		return p;

		function tickStep() {
			return tick(s, step);
		}
	};


	return s;

	function setTimer() {}
	function clearTimer() {}
	function now() { return this._now; }
}

function tick(s, step) {
	return new promise.Promise(function(resolve) {
		setTimeout(function() {
			s._now += step;
			s._runReadyTasks();
			resolve(s.now());
		}, 0);
	});
}

function thrower(e) {
	throw e;
}

function identity(x) {
	return x;
}