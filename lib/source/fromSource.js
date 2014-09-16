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
 * @param {{iterator:function():Object, scheduler:Scheduler, disposer:function():*}} source
 * @returns {Stream} stream containing all items emitted by the source
 */
function fromSource(source) {
	return new Stream(stepSource, source, source.scheduler, source.disposer);
}

function stepSource(queue) {
	return getIterator(queue).next();
}
