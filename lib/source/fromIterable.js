/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var resolve = require('../Promise').resolve;
var scheduler = require('../Scheduler');

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
	resolve(this).then(runIteratorProducer);
}

function runIteratorProducer(producer) {
	if(!producer.active) {
		return;
	}

	var x = producer.iterator.next();
	if(x.done) {
		producer.sink.end(scheduler.now, x.value);
	} else {
		producer.sink.event(scheduler.now(), x.value);
	}

	return resolve(producer).then(runIteratorProducer);
}
