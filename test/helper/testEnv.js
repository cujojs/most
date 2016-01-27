/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../../lib/Stream');
var PropagateTask = require('../../lib/scheduler/PropagateTask');
var Scheduler = require('../../lib/scheduler/Scheduler');
var VirtualTimer = require('./VirtualTimer');
var runSource = require('../../lib/runSource');
var dispose = require('../../lib/disposable/dispose');
var empty = require('../../lib/source/core').empty;

exports.newEnv = newEnv;
exports.ticks = ticks;
exports.collectEvents = collectEvents;
exports.drain = drain;
exports.atTimes = atTimes;
exports.makeEvents = makeEvents;

function TestEnvironment(timer, scheduler) {
	this.timer = timer;
	this.scheduler = scheduler;
}

TestEnvironment.prototype.tick = function(dt) {
	this.timer.tick(dt);
	return this;
};

function newEnv() {
	var timer = new VirtualTimer();
	return new TestEnvironment(timer, new Scheduler(timer));
}

function ticks(dt) {
	return newEnv().tick(dt);
}

function collectEvents(stream, env) {
	var into = [];
	var scheduler = env.scheduler;
	return runSource.withScheduler(function(x) {
		into.push({ time: scheduler.now(), value: x });
	}, stream.source, scheduler)
	.then(function() {
		return into;
	});
}

function drain(stream, env) {
	return runSource.withScheduler(noop, stream.source, env.scheduler);
}

function noop() {}

function makeEvents(dt, n) {
	var events = new Array(n);
	for(var i=0; i<n; ++i) {
		events[i] = { time: (i*dt), value: i };
	}
	return atTimes(events);
}

function atTimes(array) {
	return array.length === 0 ? empty()
		: new Stream(new AtTimes(array));
}

function AtTimes(array) {
	this.events = array;
}

AtTimes.prototype.run = function(sink, scheduler) {
	var s = this.events.reduce(function(s, event) {
		return appendEvent(sink, scheduler, s, event);
	}, { tasks: [], time: 0 });

	var end = scheduler.delay(s.time, PropagateTask.end(void 0, sink));

	return dispose.create(cancelAll, s.tasks.concat(end));
};

function appendEvent(sink, scheduler, s, event) {
	var t = Math.max(s.time, event.time);
	var task = scheduleEvent(sink, scheduler, t, event.value);
	return { tasks: s.tasks.concat(task), time: t };
}

function scheduleEvent(sink, scheduler, t, x) {
	return scheduler.delay(t, PropagateTask.event(x, sink));
}

function cancelAll(tasks) {
	return Promise.all(tasks.map(cancelOne));
}

function cancelOne(task) {
	return task.cancel();
}
