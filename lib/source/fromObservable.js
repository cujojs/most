/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');

module.exports = fromObservable;

function fromObservable(observable) {
	return observable instanceof Stream ? observable
		: new Stream(new ObservableSource(observable));
}

function ObservableSource(observable) {
	this.observable = observable;
}

ObservableSource.prototype.run = function(sink, scheduler) {
	return new SubscriberSink(this.observable, sink, scheduler);
};

function SubscriberSink(observable, sink, scheduler) {
	this.sink = sink;
	this.scheduler = scheduler;
	this.subscription = observable.subscribe(this);
}

SubscriberSink.prototype.dispose = function() {
	return this.subscription.unsubscribe();
};

SubscriberSink.prototype.next = function(x) {
	this.sink.event(this.scheduler.now(), x);
};

SubscriberSink.prototype.complete = function(x) {
	this.sink.end(this.scheduler.now(), x);
};

SubscriberSink.prototype.error = function(e) {
	this.sink.error(this.scheduler.now(), e);
};
