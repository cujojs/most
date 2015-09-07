/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var base = require('../base');
var ScheduledTask = require('./ScheduledTask');

var findIndex = base.findIndex;

module.exports = Scheduler;

function Scheduler(setTimer, clearTimer, now) {
	this.now = now;
	this._setTimer = setTimer;
	this._clearTimer = clearTimer;
	this.defaultPriority = 0;

	this._timer = null;
	this._nextArrival = 0;
	this._tasks = [];

	var self = this;
	this._runReadyTasksBound = function() {
		self._runReadyTasks(self.now());
	};
}

Scheduler.prototype.at = function(time, task, priority) {
	return this.schedule(this.now(), time, -1, task, priority);
};

Scheduler.prototype.asap = function(task, priority) {
	return this.relative(0, -1, task, priority);
};

Scheduler.prototype.delay = function(delay, task, priority) {
	return this.relative(delay, -1, task, priority);
};

Scheduler.prototype.periodic = function(period, task, priority) {
	return this.relative(0, period, task, priority);
};

Scheduler.prototype.relative = function(delay, period, task, priority) {
	var now = this.now();
	return this.schedule(now, now + Math.max(0, delay), period, task, priority);
};

Scheduler.prototype.schedule = function(now, time, period, task, priority) {
	if(typeof priority !== 'number') {
		priority = this.defaultPriority;
	}

    var st = new ScheduledTask(time, period, priority, task, this);

	insertByTime(st, this._tasks);
	this._scheduleNextRun(now);
	return st;
};

Scheduler.prototype.cancel = function(task) {
	task.active = false;
	var i = findIndex(task, this._tasks);

	if(i >= 0) {
		this._tasks.splice(i, 1);
		this._reschedule();
	}
};

Scheduler.prototype.cancelAll = function(f) {
	this._tasks = base.removeAll(f, this._tasks);
	this._reschedule();
};

Scheduler.prototype._reschedule = function() {
	if(this._tasks.length === 0) {
		this._unschedule();
	} else {
		this._scheduleNextRun(this.now());
	}
};

Scheduler.prototype._unschedule = function() {
	this._clearTimer(this._timer);
	this._timer = null;
};

Scheduler.prototype._runReadyTasks = function(now) {
	this._timer = null;

	this._runTasks(this._collectReadyTasks(now));

	this._scheduleNextRun(this.now());
};

Scheduler.prototype._collectReadyTasks = function(now) {
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

	this._tasks = base.drop(i, tasks);

	return toRun;
};

Scheduler.prototype._runTasks = function(tasks) {
	// Run all ready tasks
	var l = tasks.length;
	var task;

	for(var i=0; i<l; ++i) {
		task = tasks[i];
		runTask(task);

		// Reschedule periodic repeating tasks
		// Check active again, since a task may have canceled itself
		if(task.period >= 0 && task.active) {
			task.time = task.time + task.period;
			insertByTime(task, this._tasks);
		}
	}
};

Scheduler.prototype._scheduleNextRun = function(now) {
	if(this._tasks.length === 0) {
		return;
	}

	var nextArrival = this._tasks[0].time;

	if(this._timer === null) {
		this._scheduleNextArrival(nextArrival, now);
	} else if(nextArrival < this._nextArrival) {
		this._unschedule();
		this._scheduleNextArrival(nextArrival, now);
	}
};

Scheduler.prototype._scheduleNextArrival = function(nextArrival, now) {
	this._nextArrival = nextArrival;
	var delay = Math.max(0, nextArrival - now);
	this._timer = this._setTimer(this._runReadyTasksBound, delay);
};

function insertByTime(task, tasks) {
	tasks.splice(findInsertion(task, tasks), 0, task);
}

function findInsertion(task, tasks) {
	var i = binarySearch(byTimeAndPriority, task, tasks);
	var l = tasks.length;
	var t = task.time;
	var p = task.priority;

	while(i<l && t === tasks[i].time && p === tasks[i].priority) {
		++i;
	}

	return i;
}

function binarySearch(compare, x, sortedArray) {
	var lo = 0;
	var hi = sortedArray.length;
	var mid, y;
	var c;

	while (lo < hi) {
		mid = Math.floor((lo + hi) / 2);
		y = sortedArray[mid];

		c = compare(x, y);

		if (c === 0) {
			return mid;
		} else if (c < 0) {
			hi = mid;
		} else {
			lo = mid + 1;
		}
	}
	return hi;
}

function byTimeAndPriority(t1, t2) {
	var t1t = t1.time;
	var t2t = t2.time;

	var t1p = t1.priority;
	var t2p = t2.priority;

	return t1t < t2t ? -1
		: t1t > t2t ? 1
		: t1p < t2p ? -1
		: t1p > t2p ? 1
		: 0;
}

function runTask(task) {
	try {
		return task.run();
	} catch(e) {
		return task.error(e);
	}
}
