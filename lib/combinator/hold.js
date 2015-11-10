/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var MulticastSource = require('../source/MulticastSource');

exports.hold = hold;

function hold(stream) {
	return new Stream(new Hold(stream.source));
}

function Hold(source) {
	MulticastSource.call(this, source);
	this.time = -Infinity;
	this.value = void 0;
	this.held = false;
}

Hold.prototype = Object.create(MulticastSource.prototype);

Hold.prototype.add = function(sink) {
	var len = MulticastSource.prototype.add.call(this, sink);
	if(this.held) {
		sink.event(this.time, this.value);
	}
	return len;
};

Hold.prototype.event = function(t, x) {
	this.time = t;
	this.value = x;
	this.held = true;
	return MulticastSource.prototype.event.call(this, t, x);
};
