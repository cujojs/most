/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var resolve = require('./Promise').resolve;

// TODO
// -  error handling
// -  zip

module.exports = Stream;

function Stream(source) {
	this.source = source;
}

Stream.empty = empty;
Stream.never = never;

function empty() {
	return new Stream(new EmptySource());
}

function never() {
	return new Stream(new NeverSource());
}

function EmptySource() {}

EmptySource.prototype.run = function(sink) {
	resolve(sink).then(end);
};

function end(sink) {
	return sink.end(0);
}

function NeverSource() {}

NeverSource.prototype.run = function() {};
