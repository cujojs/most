/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var defaultScheduler = require('../scheduler/defaultScheduler');
var dispose = require('../disposable/dispose');

exports.subscribe = subscribe;

function subscribe(subscriber, stream) {
	var disposable = dispose.settable();
	var observer = new SubscribeObserver(subscriber, disposable);

	disposable.setDisposable(stream.source.run(observer, defaultScheduler));

	return disposable;
}

function SubscribeObserver(subscriber, disposable) {
	this.subscriber = subscriber;
	this.disposable = disposable;
}

SubscribeObserver.prototype.event = function(t, x) {
	if(typeof this.subscriber.next === 'function') {
		this.subscriber.next(x);
	}
};

SubscribeObserver.prototype.end = function(t, x) {
	dispose(this.subscriber, this.disposable, x);
};

SubscribeObserver.prototype.error = function(t, e) {
	dispose(this.subscriber, this.disposable, e);
};

function dispose(subscriber, disposable, x) {
	Promise.resolve(disposable.dispose()).then(function () {
		if(typeof subcriber.complete === 'function') {
			subscriber.complete(x);
		}
	}, function(e) {
		if(typeof subcriber.error === 'function') {
			subscriber.error(e);
		}
	});
}
