/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var resolve = require('../Promise').resolve;

exports.of = function(x) {
	return new Stream(new ValueSource(x));
};

function ValueSource(x) {
	this.value = x;
}

ValueSource.prototype.run = function(sink) {
	return new ValueProducer(this.value, sink);
};

function ValueProducer(x, sink) {
	this.value = x;
	this.sink = sink;
	this.active = true;
	resolve(this).then(emit).catch(function(e) {
		sink.error(0, e);
	});
}

function emit(producer) {
	producer._emit();
}

ValueProducer.prototype._emit = function() {
	if(!this.active) {
		return;
	}

	this.sink.event(0, this.value);
	this.sink.end(0, void 0);
};

ValueProducer.prototype.dispose = function() {
	this.active = false;
};