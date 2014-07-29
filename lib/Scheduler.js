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

Scheduler.defaultNow = defaultNow;

var defaultScheduler;

Scheduler.ensure = function(scheduler) {
	if(typeof scheduler === 'undefined') {
		return Scheduler.getDefault();
	}
	return scheduler;
};

Scheduler.getDefault = function() {
	if(defaultScheduler === void 0) {
		defaultScheduler = new Scheduler();
	}
	return defaultScheduler;
};

Scheduler.setDefault = function(scheduler) {
	if(scheduler != null) {
		defaultScheduler = scheduler;
	}
};

function Scheduler(setTimer, clearTimer, now, errorHandler) {
	this.now = now || defaultNow;
	this._setTimer = setTimer || defaultSetTimer;
	this._clearTimer = clearTimer || defaultClearTimer;
	this._handleError = errorHandler || logAndReschedule;
	this._timer = void 0;
	this._tasks = [];

	var self = this;
	this._runReadyTasksBound = function() {
		self._runReadyTasks();
	};
}

Scheduler.prototype = {
	periodic: function(period, run, state) {
		return this._schedule(period, period, run, state);
	},

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

	shutdown: function() {
		this._clearTimer(this._timer);
		this._tasks.length = 0;
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

	_scheduleNextRun: function(now) {
		this._clearTimer(this._timer);

		if(this._tasks.length === 0) {
			return;
		}

		var nextArrival = Math.max(0, this._tasks[0].arrival - now);
		this._timer = this._setTimer(this._runReadyTasksBound, nextArrival);
	},

	_scheduleNextTask: function(now, task) {
		if(task.period >= 0) {
			task.deadline = task.deadline + task.period;
			task.arrival = task.arrival + task.period;

			this._tasks = insertByDeadline(this._tasks, task);
		}
	},

	_runReadyTasks: function() {
		var now = this.now();
		var tasks = [];

		while(this._tasks.length > 0 && this._tasks[0].arrival <= now) {
			tasks.push(this._runTask(now, this._tasks.shift()));
		}

		for(var i=0; i<tasks.length; ++i) {
			this._scheduleNextTask(now, tasks[i]);
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
	});
	return task;
}
