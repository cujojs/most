/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/*global setTimeout, clearTimeout*/
var Scheduler = require('./Scheduler');
var defer = require('../defer');

// Default timer functions
var defaultSetTimer, defaultClearTimer;

function Task(f) {
	this.f = f;
	this.active = true;
}

Task.prototype.run = function() {
	if(!this.active) {
		return;
	}
	var f = this.f;
	return f();
};

Task.prototype.error = function(e) {
	throw e;
};

Task.prototype.cancel = function() {
	this.active = false;
};

function runAsTask(f) {
	var task = new Task(f);
	defer(task);
	return task;
}

if(typeof process === 'object' && typeof process.nextTick === 'function') {
	defaultSetTimer = function(f, ms) {
		return ms <= 0 ? runAsTask(f) : setTimeout(f, ms);
	};

	defaultClearTimer = function(t) {
		return t instanceof Task ? t.cancel() : clearTimeout(t);
	};
}
else {
	defaultSetTimer = function(f, ms) {
		return setTimeout(f, ms);
	};

	defaultClearTimer = function(t) {
		return clearTimeout(t);
	};
}

module.exports = new Scheduler(defaultSetTimer, defaultClearTimer, Date.now);
