/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var base = require('./base');

var findIndex = base.findIndex;
var slice = base.slice;

// Default timer functions
function defaultSetTimer(f, ms) {
	return setTimeout(f, ms);
}

function defaultClearTimer(t) {
	return clearTimeout(t);
}

function Task(time, period, run, error, x, y) {
	this.time = time;
	this.period = period;
	this.active = true;
	this._run = run;
	this.error = error;
	this._x = x;
	this._y = y;
}

Task.prototype.run = function() {
	return this._run(this._x, this._y, this.time);
};

function Scheduler(setTimer, clearTimer, now) {
	this.now = now || Date.now;
	this._setTimer = setTimer || defaultSetTimer;
	this._clearTimer = clearTimer || defaultClearTimer;
	this._timer = null;
	this._nextArrival = 0;
	this._tasks = [];

	var self = this;
	this._runReadyTasksBound = function() {
		self._runReadyTasks();
	};
}

Scheduler.prototype.delay = function(delay, run, error, x, y) {
	return this.schedule(delay, 0, run, error, x, y);
};

Scheduler.prototype.periodic = function(period, run, error, x, y) {
	return this.schedule(0, period, run, error, x, y);
};

Scheduler.prototype.schedule = function(delay, period, run, error, x, y) {
	var now = this.now();
	var task = new Task(now + Math.max(0, delay), Math.max(0, period), run, error, x, y);

	insertByTime(this._tasks, task);
	this._scheduleNextRun(now);
	return task;
};

Scheduler.prototype.cancel = function(task) {
	task.active = false;
	var i = findIndex(task, this._tasks);
	if(i >= 0) {
		this._tasks.splice(i, 1);

		if(this._tasks.length === 0) {
			this._unschedule();
		} else if(i === 0) {
			this._scheduleNextRun(this.now());
		}
	}
};

Scheduler.prototype._unschedule = function() {
	this._clearTimer(this._timer);
	this._timer = null;
};

Scheduler.prototype._runReadyTasks = function() {
	/*jshint maxcomplexity:6*/
	this._timer = null;

	var now = this.now();
	var tasks = this._tasks;
	var l = tasks.length;
	var toRun = [];

	var task, i;

	// Collect all active tasks with time <= now
	for(i=0; i<l; ++i) {
		task = tasks[i];
		if(task.time > now) {
			break;
		}
		if(task.active) {
			toRun.push(task);
		}
	}

	this._tasks = slice(i, tasks);

	// Run all ready tasks
	for(i=0, l=toRun.length; i<l; ++i) {
		task = toRun[i];
		this._runTask(task);

		// Reschedule periodic repeating tasks
		// Check active again, since a task may have canceled itself
		if(task.period > 0 && task.active) {
			task.time = task.time + task.period;
			insertByTime(this._tasks, task);
		}
	}

	this._scheduleNextRun(this.now());
};

Scheduler.prototype._runTask = function(task) {
	try {
		task.run();
	} catch(e) {
		task.error(e, task, this);
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
		this._unschedule();
		this._schedulerNextArrival(nextArrival, now);
	}
};

Scheduler.prototype._schedulerNextArrival = function(nextArrival, now) {
	this._nextArrival = nextArrival;
	var delay = Math.max(0, nextArrival - now);
	this._timer = this._setTimer(this._runReadyTasksBound, delay);
};

function insertByTime(tasks, task) {
	var i = findInsertion(task, tasks);
	var l = tasks.length;
	var t = task.time;
	while(i<l && t === tasks[i].time) {
		++i;
	}

	tasks.splice(i, 0, task);
}

function findInsertion(x, sortedArray) {
	var lo = 0;
	var hi = sortedArray.length;
	var mid, y;

	while (lo < hi) {
		mid = Math.floor((lo + hi) / 2);
		y = sortedArray[mid];

		if (x.time === y.time) {
			return mid;
		} else if (x.time < y.time) {
			hi = mid;
		} else {
			lo = mid + 1;
		}
	}
	return hi;
}

module.exports = new Scheduler();
