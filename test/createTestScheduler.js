var Scheduler = require('../lib/Scheduler');
var promise = require('../lib/promises');

var resolve = promise.Promise.resolve;

module.exports = createTestScheduler;

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