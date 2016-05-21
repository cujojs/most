/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var defer = require('../task').defer;

/*global setTimeout, clearTimeout*/

module.exports = Timer;

function Timer() {}

Timer.prototype.now = Date.now;

Timer.prototype.setTimer = function(f, dt) {
	return dt <= 0 ? runAsTask(f) : setTimeout(f, dt);
};

Timer.prototype.clearTimer = function(t) {
	return t instanceof Task ? t.cancel() : clearTimeout(t);
};

function Task(f) {
	this.f = f;
	this.active = true;
}

Task.prototype.run = function() {
	return this.active && this.f();
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
