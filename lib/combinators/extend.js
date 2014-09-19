/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var concat = require('./monoid').concat;
var promise = require('../promises');

var when = promise.when;

exports.cycle = cycle;
exports.cons = consStream;

/**
* Tie a stream into a circle, thus creating an infinite stream
* @param {Stream} stream stream to make infinite
* @returns {Stream} new infinite stream
*/
function cycle(stream) {
	return stream.beget(stepCycle, { state: stream.state, stream: stream });
}

function stepCycle(s) {
	return when(function(i) {
		if(i.done) {
			return stepCycle({ state: s.stream.state, stream: s.stream });
		}

		return i.withState({ state: i.state, stream: s.stream });
	}, s.stream.step(s.state));
}

/**
* @param {*} x
* @param {Stream} stream
* @returns {Stream} new stream containing x followed by all items in this stream
*/
function consStream(x, stream) {
	return concat(Stream.of(x), stream);
}
