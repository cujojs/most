/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var scheduler = require('./scheduler/defaultScheduler');

/*global Symbol */
var observableSymbol = '@@observable';
if(typeof Symbol === 'function' && typeof Symbol.for === 'function') {
	observableSymbol = Symbol.for('observable');
}

exports.subscribe = subscribe;
exports.symbol = observableSymbol;
exports.getObservable = getObservable;

function getObservable(x) {
	return x[observableSymbol];
}

function subscribe(subscriber, stream) {
	return new ObservableSink(subscriber, stream.source);
}

function ObservableSink(subscriber, source) {
	this.disposable = source.run(this, scheduler);
	this.subscriber = subscriber;
}

ObservableSink.prototype.unsubscribe = function() {
	return this.disposable.dispose();
};

ObservableSink.prototype.event = function(t, x) {
	this.subscriber.next(x);
};

ObservableSink.prototype.end = function(t, x) {
	this.disposable.dispose();
	this.subscriber.complete(x);
};

ObservableSink.prototype.error = function(t, e) {
	this.disposable.dispose();
	this.subscriber.error(e);
};
