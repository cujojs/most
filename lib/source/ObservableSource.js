/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

module.exports = ObservableSource;

function ObservableSource(subscribe) {
	this._subscribe = subscribe;
}

ObservableSource.prototype.run = function(sink, scheduler) {
	return this._subscribe(new ObservableProducer(sink, scheduler));
};

function ObservableProducer(sink, scheduler) {
	this.sink = sink;
	this.scheduler = scheduler;
}

ObservableProducer.prototype.next = function(x) {
	tryEvent(this.scheduler.now(), x, this.sink);
};

ObservableProducer.prototype['return'] = function(x) {
	tryEnd(this.scheduler.now(), x, this.sink);
};

ObservableProducer.prototype['throw'] = function(e) {
	this.sink.error(this.scheduler.now(), e);
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