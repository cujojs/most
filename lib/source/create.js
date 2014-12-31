/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var Disposable = require('../disposable/Disposable');
var MulticastSource = require('./MulticastSource');
var noop = require('../base').noop;

exports.create = create;

function create(run) {
	return new Stream(new MulticastSource(new SubscriberSource(run)));
}

function SubscriberSource(subscribe) {
	this._subscribe = subscribe;
}

SubscriberSource.prototype.run = function(sink, scheduler) {
	var unsubscribe = this._subscribe(add, end, error);

	return new Disposable(typeof unsubscribe === 'function' ? unsubscribe : noop);

	function add(x) {
		tryEvent(scheduler.now(), x, sink);
	}

	function end(x) {
		tryEnd(scheduler.now(), x, sink);
	}

	function error(e) {
		sink.error(scheduler.now(), e);
	}
};

function tryEvent(t, x, sink) {
	try {
		sink.event(t, x);
	} catch(e) {
		sink.error(t, e);
	}
}

function tryEnd(t, x, sink) {
	try {
		sink.end(t, x);
	} catch(e) {
		sink.error(t, e);
	}
}