/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

exports.tryEvent = tryEvent;
exports.tryEnd = tryEnd;
exports.error = error;

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

function error(t, e, sink) {
	sink.error(t, e);
}