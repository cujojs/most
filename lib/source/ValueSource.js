/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var fatal = require('../fatalError');
var resolve = require('../Promise').resolve;

module.exports = ValueSource;

function ValueSource(emit, x) {
	this.emit = emit;
	this.value = x;
}

ValueSource.prototype.run = function(sink) {
	return new ValueProducer(this.emit, this.value, sink);
};

function ValueProducer(emit, x, sink) {
	this.value = x;
	this.sink = sink;
	this.active = true;
	var self = this;
	resolve(this).then(emit).catch(function(e) {
		error(self, e);
	});
}

ValueProducer.prototype.dispose = function() {
	this.active = false;
};

function error(producer, e) {
	if(!producer.active) {
		return fatal(e);
	}
	producer.sink.error(0, e);
}
