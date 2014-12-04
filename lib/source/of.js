/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var ValueSource = require('../source/ValueSource');

exports.of = function(x) {
	return new Stream(new ValueSource(event, x));
};

function event(producer) {
	if(!producer.active) {
		return;
	}
	producer.sink.event(0, producer.value);
	producer.sink.end(0, void 0);
}
