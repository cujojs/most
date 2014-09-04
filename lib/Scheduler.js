/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var findIndex = require('./binarySearch').findIndex;

module.exports = Scheduler;

// Default timer functions
var defaultNow = Date.now;
function defaultSetTimer(f, ms) {
	return setTimeout(f, ms);
}

function defaultClearTimer(t) {
	return clearTimeout(t);
}

function Scheduler(setTimer, clearTimer, now, errorHandler) {
	this.now = now || defaultNow;
	this._setTimer = setTimer || defaultSetTimer;
	this._clearTimer = clearTimer || defaultClearTimer;
	this._handleError = errorHandler || logAndReschedule;
	this._timer = null;
	this._nextArrival = 0;
	this._tasks = [];

	var self = this;
	this._runReadyTasksBound = function() {
		self._runReadyTasks();
	};
}

Scheduler.prototype = {
	delayed: function(delay, run, state) {
		return this._schedule(delay, -1, run, state);
	},

	cancel: function(task) {
		var i = this._tasks.indexOf(task);
		if(i >= 0) {
			this._tasks.splice(i, 1);
			if(i === 0) {
				this._scheduleNextRun(this.now());
			}
		}
	},

	_schedule: function(delay, period, run, state) {
		var now = this.now();
		delay = Math.max(0, delay);

		var task = {
			period: period,
			deadline: now + delay + Math.max(0, period),
			arrival: now + delay,
			run: run,
			state: state
		};

		this._tasks = insertByDeadline(this._tasks, task);
		this._scheduleNextRun(now);
		return task;
	},

	_schedulerNextArrival: function (nextArrival, now) {
		this._nextArrival = nextArrival;
		var delay = Math.max(0, nextArrival - now);
		this._timer = this._setTimer(this._runReadyTasksBound, delay);
	},

	_scheduleNextRun: function(now) {
		if(this._tasks.length === 0) {
			return;
		}

		var nextArrival = this._tasks[0].arrival;

		if(this._timer === null) {
			this._schedulerNextArrival(nextArrival, now);
		} else if(nextArrival < this._nextArrival) {
			this._clearTimer(this._timer);
			this._schedulerNextArrival(nextArrival, now);
		}
	},

	_scheduleNextTask: function(now, task) {
		if(task.period >= 0) {
			task.deadline = task.deadline + task.period;
			task.arrival = task.arrival + task.period;

			this._tasks = insertByDeadline(this._tasks, task);
		}
	},

	_runReadyTasks: function() {
		this._timer = null;

		var now = this.now();
		var tasks = this._tasks;
		var reschedule = [];

		while(tasks.length > 0 && tasks[0].arrival <= now) {
			reschedule.push(this._runTask(now, tasks.shift()));
		}

		for(var i=0; i<reschedule.length; ++i) {
			this._scheduleNextTask(now, reschedule[i]);
		}

		this._scheduleNextRun(now);
	},

	_runTask: function(now, task) {
		try {
			var result = task.run(task.state, now);
			if(result !== void 0) {
				task.state = result;
			}
			return task;
		} catch(e) {
			return this._handleError.call(void 0, e, task);
		}
	}
};

function insertByDeadline(tasks, task) {
	if(tasks.length === 0) {
		tasks.push(task);
	} else {
		tasks.splice(findIndex(compareByDeadline, task, tasks), 0, task);
	}

	return tasks;
}

function compareByDeadline(a, b) {
	return a.deadline - b.deadline;
}

function logAndReschedule (e, task) {
	setTimeout(function() {
		throw e;
	}, 0);
	return task;
}
