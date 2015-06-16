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

	if(this._running) {
		return;
	}

	return this._scheduleNextRun(dt + this._time);
};

TestScheduler.prototype._unschedule = function() {};

TestScheduler.prototype._scheduleNextRun = function(now) {
	if(this._targetTime < now) {
		this._targetTime = now;
	}

	//if(this._running) {
	//	return;
	//}

	this._running = true;
	return this._advanceClock();
};

TestScheduler.prototype._advanceClock = function() {
	console.log(this._time, this._targetTime);
	if(this._time < this._targetTime) {
		return defer(new AdvanceClockTask(this));
	}
	this._running = false;
};

function AdvanceClockTask(scheduler) {
	this.scheduler = scheduler;
}

AdvanceClockTask.prototype.run = function() {
    //this.scheduler._time++;
    this.scheduler._runReadyTasks(this.scheduler._time);

	this.scheduler._time++;

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
