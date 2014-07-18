var Scheduler = require('../lib/Scheduler');

module.exports = createTestScheduler;

/**
 * @returns {Scheduler} a scheduler whose clock is externally controllable
 *  via its tick(ticks:Number) method.
 */
function createTestScheduler() {
	var timeout;
	var currentTime = 0;
	var s = new Scheduler(setTimer, clearTimer, now, function(e) {
		throw e;
	});

	s.tick = function(ticks) {
		clearTimeout(timeout);
		var self = this;
		timeout = setTimeout(function() {
			currentTime += ticks;
			self._runReadyTasks();
		}, 1);
	};

	return s;

	function setTimer() {}
	function clearTimer() {}
	function now() { return currentTime; }
}