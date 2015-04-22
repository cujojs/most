/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var Disposable = require('../disposable/Disposable');
var MulticastSource = require('./MulticastSource');
var AsyncSource = require('./AsyncSource');
var noop = require('../base').noop;
var sink = require('../sink/sink');

var tryEvent = sink.tryEvent;
var tryEnd   = sink.tryEnd;

exports.create = create;

function create(run) {
	return new Stream(new MulticastSource(new AsyncSource(new SubscriberSource(run))));
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
