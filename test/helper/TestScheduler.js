var runSource = require('../../lib/runSource');
var defer = require('../../lib/defer');
var timestamp = require('../../lib/combinator/timestamp');
var Scheduler = require('../../lib/scheduler/Scheduler');

module.exports = TestScheduler;

function TestScheduler() {
	this._time = 0;
	this._targetTime = 0;
	this._running = false;
	Scheduler.call(this, void 0, void 0,
		function() { return this._time; });
}

TestScheduler.prototype = Object.create(Scheduler.prototype);

TestScheduler.prototype.collect = function(stream) {
	return this.runStream(stream).then(getEvents);
};

TestScheduler.prototype.drain = function(stream) {
	return this.runStream(stream).then(getValue);
};

TestScheduler.prototype.runStream = function(stream) {
	var s = timestamp.timestamp(stream);
	var events = [];
	return runSource.withScheduler(function(x) {
		events.push(x);
	}, s.source, this).then(function(x) {
		return { events: events, value: x };
	});
};

TestScheduler.prototype.tick = function(dt) {
	if(dt <= 0) {
		return;
	}

	return this._setNow(dt + this._time);
};

TestScheduler.prototype._setNow = function(t) {
	this._targetTime = Math.max(this._time, Math.max(this._targetTime, t));

	if(this._targetTime === this._time || this._running) {
		return;
	}

	this._running = true;
	var self = this;
	setTimeout(function() {
		self._advanceClock();
	}, 0);
};

TestScheduler.prototype._advanceClock = function() {
	if(this._time === this._targetTime) {
		this._running = false;
		return;
	}

	return defer(new AdvanceClockTask(this));
};

TestScheduler.prototype._unschedule = function() {};

TestScheduler.prototype._scheduleNextRun = function(now) {
	if(this._tasks.length === 0 || now < this._tasks[0].time) {
		return;
	}

	this._setNow(now);
};

function AdvanceClockTask(scheduler) {
	this.scheduler = scheduler;
}

AdvanceClockTask.prototype.run = function() {
	if(this.scheduler._tasks.length === 0) {
		this.scheduler._time = this.scheduler._targetTime;
		return;
	}

	if(this.scheduler.time === this.scheduler._targetTime) {
		return;
	}

	this.scheduler._time = this.scheduler._tasks[0].time;
	this.scheduler._runReadyTasks(this.scheduler._time);
	return this.scheduler._advanceClock();
};

AdvanceClockTask.prototype.error = function(e) {
	console.error(e);
};

function getEvents(result) {
	return result.events;
}

function getValue(result) {
	return result.value;
}
