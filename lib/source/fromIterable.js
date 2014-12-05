/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var getIterator = require('../iterable').getIterator;
var scheduler = require('../Scheduler');
var fatal = require('../fatalError');

exports.fromIterable = fromIterable;

function fromIterable(iterable) {
	return new Stream(new IterableSource(iterable));
}

function IterableSource(iterable) {
	this.iterable = iterable;
}

IterableSource.prototype.run = function(sink) {
	return new IteratorProducer(getIterator(this.iterable), sink);
};

function IteratorProducer(iterator, sink) {
	this.iterator = iterator;
	this.sink = sink;
	this.active = true;

	scheduler.asap(runProducer, propagateErrorIfActive, this);
}

function runProducer(producer) {
	if(!producer.active) {
		return;
	}

	var x = producer.iterator.next();
	var t = scheduler.now();
	if(x.done) {
		producer.sink.end(t, x.value);
	} else {
		producer.sink.event(t, x.value);
	}

	this.scheduler.asap(runProducer, propagateErrorIfActive, this);
}

function propagateErrorIfActive(e) {
	var producer = this._x;
	if(!producer.active) {
		fatal(e);
	}
	producer.sink.error(this.scheduler.now(), e);
}