/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var MulticastSource = require('@most/multicast').MulticastSource;
var DeferredSink = require('../sink/DeferredSink');

exports.create = create;

/**
 * @deprecated Use `@most/create` instead: https://github.com/mostjs/create
 */
function create(run) {
	return new Stream(new MulticastSource(new SubscriberSource(run)));
}

function SubscriberSource(subscribe) {
	this._subscribe = subscribe;
}

SubscriberSource.prototype.run = function(sink, scheduler) {
	return new Subscription(new DeferredSink(sink), scheduler, this._subscribe);
};

function Subscription(sink, scheduler, subscribe) {
	this.sink = sink;
	this.scheduler = scheduler;
	this._unsubscribe = this._init(subscribe);
}

Subscription.prototype._init = function(subscribe) {
	var s = this;

	try {
		return subscribe(add, end, error);
	} catch(e) {
		error(e);
	}

	function add(x) {
		s.sink.event(s.scheduler.now(), x);
	}
	function end(x) {
		s.sink.end(s.scheduler.now(), x);
	}
	function error(e) {
		s.sink.error(s.scheduler.now(), e);
	}
};

Subscription.prototype.dispose = function() {
	this.active = false;
	if(typeof this._unsubscribe === 'function') {
		return this._unsubscribe.call(void 0);
	}
};
