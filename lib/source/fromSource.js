/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Stream = require('../Stream');
var iterable = require('../iterable');

var getIterator = iterable.getIterator;

module.exports = fromSource;

/**
 * Create a stream from an event source
 * @private
 * @param {{iterator:function():Object, scheduler:Scheduler}} source
 * @returns {Stream} stream containing all items emitted by the source
 */
function fromSource(source) {
	return new Stream(queueNext, source, source.scheduler, queueDispose);
}

function queueNext(queue) {
	return getIterator(queue).next();
}

function queueDispose(t, x, queue) {
	return queue.dispose(t, x);
}