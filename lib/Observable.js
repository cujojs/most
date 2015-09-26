/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var scheduler = require('./scheduler/defaultScheduler');

var observableSymbol = '@@observable';
if(typeof Symbol === 'function' && typeof Symbol.for === 'function') {
	observableSymbol = Symbol.for('observable')
}

exports.subscribe = subscribe;
exports.symbol = observableSymbol;

function subscribe(subscriber, stream) {
	var sink = new ObservableSink(dispose, subscriber);
	var disposable = stream.source.run(sink, scheduler);

	return dispose;

	function dispose() {
		disposable.dispose();
	}
}

function ObservableSink(dispose, subscriber) {
	this.dispose = dispose;
	this.subscriber = subscriber;
}

ObservableSink.prototype.event = function(t, x) {
	this.subscriber.next(x);
};

ObservableSink.prototype.end = function(t, x) {
	this.subscriber.complete(x);
};

ObservableSink.prototype.error = function(t, e) {
	this.dispose();
	this.subscriber.error(e);
};
