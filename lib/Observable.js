var Stream = require('./Stream');
var ObservableSource = require('./source/ObservableSource');
var MulticastSource = require('./source/MulticastSource');
var AsyncSource = require('./source/AsyncSource');
var scheduler = require('./scheduler/defaultScheduler');

exports.create = createObservable;
exports.observer = observer;

function createObservable(generator) {
	return new Stream(new MulticastSource(new AsyncSource(new ObservableSource(generator))));
}

function observer(handler, stream) {
	return stream.source.run(new ObserverSink(handler), scheduler);
}

function ObserverSink(handler) {
	this.handler = handler;
}

ObserverSink.prototype.event = function(t, x) {
	this.handler.next(x);
};

ObserverSink.prototype.end = function(t, x) {
	this.handler['return'](x);
};

ObserverSink.prototype.error = function(t, e) {
	this.handler['throw'](e);
};