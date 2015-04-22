/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var fatalError = require('../fatalError');

exports.tryEvent = tryEvent;
exports.tryEnd = tryEnd;
exports.tryError = tryError;

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

function tryError(t, e, sink) {
	try {
		sink.error(t, e);
	} catch(e) {
		fatalError(e);
	}
}