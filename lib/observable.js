/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('./Stream');
var dispose = require('./disposable/dispose');
var defaultScheduler = require('./scheduler/defaultScheduler');

/*global Symbol*/

exports.isObservable = isObservable;
exports.getObservable = getObservable;

exports.Observable = Observable;
exports.subscribe = subscribe;
exports.fromObservable = fromObservable;

exports.speciesSymbol =
	typeof Symbol === 'function' && Symbol.species || '@@species';

var observableSymbol = exports.symbol =
	typeof Symbol === 'function' && Symbol.observable || '@@observable';

function isObservable(o) {
	return typeof o[observableSymbol] === 'function';
}

function getObservable(o) {
	return o[observableSymbol]();
}

// -----------------------------------------------------------
// Observable
// Concrete implementation of ES7 Observable constructor

function Observable(subscriber) {
	if(typeof subscriber !== 'function') {
		throw new TypeError('subscriber must be a function');
	}
	Stream.call(this, new SubscriberSource(subscriber));
}

Observable.prototype = Object.create(Stream.prototype, {
	constructor: {
		value: Observable,
		enumerable: false, writable: true, configurable: true
	}
});

function SubscriberSource(subscriber) {
	this.subscriber = subscriber;
}

SubscriberSource.prototype.run = function(sink, scheduler) {
	try {
		const sub = this.subscriber(newSinkObserver(sink, scheduler));
		if(sub != null) {
			if(typeof sub.unsubscribe === 'function') {
				return dispose.newDisposable(unsubscribe, sub);
			}

			if(typeof sub === 'function') {
				return dispose.newDisposable(sub);
			}

			throw new TypeError('subscriber returned invalid subscription');
		}
	} catch(e) {
		//console.log(e.stack);
		sink.error(scheduler.now(), e);
		return dispose.empty();
	}
};

// -----------------------------------------------------------
// fromObservable
// Turn a foreign Observable into a most Stream

function fromObservable(observable) {
	return observable instanceof Stream ? observable
		: new Stream(new ObservableSource(observable));
}

function ObservableSource(observable) {
	this.observable = observable;
}

ObservableSource.prototype.run = function(sink, scheduler) {
	var sub = this.observable.subscribe(newSinkObserver(sink, scheduler));
	return dispose.newDisposable(unsubscribe, sub);
};

function newSinkObserver(sink, scheduler) {
	return {
		next: function(x) { sink.event(scheduler.now(), x); },
		complete: function(x) { sink.end(scheduler.now(), x); },
		error: function(e) { sink.error(scheduler.now(), e); }
	};
}

function unsubscribe(sub) {
	return sub.unsubscribe();
}
function SubscriptionDisposable(subscription) {
	this.subscription = subscription;
}

SubscriptionDisposable.prototype.dispose = function() {
	return this.subscription.unsubscribe();
};

// -----------------------------------------------------------
// ES7 Observable subscribe

function subscribe(observer, stream) {
	//try {
	//	console.log(typeof observer, observer);
		if(observer == null || Object(observer) !== observer) {
			throw new TypeError('subscriber must be an object');
		}
		var disposable = dispose.settable();
		var wrapped = new ObserverSink(observer, disposable);

		var d = stream.source.run(wrapped, defaultScheduler);

		disposable.setDisposable(d);

		return new DisposableSubscription(disposable);
	//} catch(e) {
	//	console.error(e.stack);
	//	throw e;
	//}
}

function ObserverSink(observer, disposable) {
	this.observer = observer;
	this.disposable = disposable;
	this.active = true;
}

ObserverSink.prototype.event = function(t, x) {
	if (!this.active) {
		return;
	}
	tryEvent(x, this.observer);
};

ObserverSink.prototype.end = function(t, x) {
	if (!this.active) {
		return;
	}
	this.active = false;
	tryDispose(this.disposable, x, this.observer.end, this.observer);
};

ObserverSink.prototype.error = function(t, x) {
	this.active = false;
	tryDispose(this.disposable, x, this.observer.error, this.observer);
};

function tryEvent(x, observer) {
	try {
		observer.next(x);
	} catch(e) {
		observer.error(e);
	}
}

function tryDispose(disposable, x, method, observer) {
	Promise.resolve(disposable.dispose()).then(function() {
		method.call(observer, x);
	}).catch(function(e) {
		observer.error(e);
	});
}

function DisposableSubscription(disposable) {
	this.disposable = disposable;
}

DisposableSubscription.prototype.unsubscribe = function() {
	this.disposable.dispose();
};

DisposableSubscription.prototype.constructor = Object;
