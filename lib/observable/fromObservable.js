/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var dispose = require('../disposable/dispose');
var symbolObservable = require('symbol-observable');

exports.fromObservable = fromObservable;

function fromObservable(observable) {
	return new Stream(new ObservableSource(observable));
}

function ObservableSource(observable) {
	this.observable = observable;
}

ObservableSource.prototype.run = function(sink, scheduler) {
	var sub = this.observable.subscribe(new SubscriberSink(sink, scheduler));
	if(typeof sub === 'function') {
		return dispose.create(sub);
	} else if(sub && typeof sub.unsubscribe === 'function') {
		return dispose.create(unsubscribe, sub);
	}

	throw new Error('Observable returned invalid subscription ' + String(sub));
}

function SubscriberSink(sink, scheduler) {
	this.sink = sink;
	this.scheduler = scheduler;
}

SubscriberSink.prototype.next = function(x) {
	this.sink.event(this.scheduler.now(), x);
}

SubscriberSink.prototype.complete = function(x) {
	this.sink.end(this.scheduler.now(), x);
}

SubscriberSink.prototype.error = function(e) {
	this.sink.error(this.scheduler.now(), e);
}

function unsubscribe(subscription) {
	return subscription.unsubscribe();
}
