/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var findIndex = require('./binarySearch').findIndex;
var base = require('./base');

var insert = base.insert;
var remove = base.remove;

module.exports = Scheduler;

// Default timer functions
var defaultNow = Date.now;
function defaultSetTimer(f, ms) {
	return setTimeout(f, ms);
}

function defaultClearTimer(t) {
	return clearTimeout(t);
}

function Task(time, run, x) {
	this.time = time;
	this._run = run;
	this._x = x;
}

Task.prototype.run = function(now) {
	return this._run(this._x, now);
};

function Scheduler(setTimer, clearTimer, now, errorHandler) {
	this.now = now || defaultNow;
	this._setTimer = setTimer || defaultSetTimer;
	this._clearTimer = clearTimer || defaultClearTimer;
	this._handleError = errorHandler || logError;
	this._timer = null;
	this._nextArrival = 0;
	this._tasks = [];

	var self = this;
	this._runReadyTasksBound = function() {
		self._runReadyTasks();
	};
}

Scheduler.prototype.schedule = function(delay, run, x) {
	var now = this.now();
	var task = new Task(now + Math.max(0, delay), run, x);

	this._tasks = insertByTime(this._tasks, task);
	this._scheduleNextRun(now);
	return task;
};

Scheduler.prototype.cancel = function(task) {
	var i = this._tasks.indexOf(task);
	if(i >= 0) {
		this._tasks = remove(i, this._tasks);
		if(i === 0) {
			this._scheduleNextRun(this.now());
		}
	}
};

Scheduler.prototype._runReadyTasks = function() {
	this._timer = null;

	var now = this.now();
	var tasks = this._tasks;

	while(tasks.length > 0 && tasks[0].time <= now) {
		this._runTask(now, tasks.shift());
	}

	this._scheduleNextRun(now);
};

Scheduler.prototype._runTask = function(now, task) {
	try {
		return task.run();
	} catch(e) {
		return this._handleError.call(void 0, e, task);
	}
};

Scheduler.prototype._scheduleNextRun = function(now) {
	if(this._tasks.length === 0) {
		return;
	}

	var nextArrival = this._tasks[0].time;

	if(this._timer === null) {
		this._schedulerNextArrival(nextArrival, now);
	} else if(nextArrival < this._nextArrival) {
		this._clearTimer(this._timer);
		this._schedulerNextArrival(nextArrival, now);
	}
};

Scheduler.prototype._schedulerNextArrival = function(nextArrival, now) {
	this._nextArrival = nextArrival;
	var delay = Math.max(0, nextArrival - now);
	this._timer = this._setTimer(this._runReadyTasksBound, delay);
};

function insertByTime(tasks, task) {
	return insert(task, findIndex(compareByTime, task, tasks), tasks);
}

function compareByTime(a, b) {
	return a.time - b.time;
}

function logError (e) {
	setTimeout(function() {
		throw e;
	}, 0);
}

