/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

module.exports = Sink;

function Sink(sink) {
	this.sink = sink;
}

Sink.prototype.event = function(t, x) {
	return this.sink.event(t, x);
};

Sink.prototype.end = function(t, x) {
	return this.sink.end(t, x);
};

Sink.prototype.error = function(t, e) {
	return this.sink.error(t, e);
};
