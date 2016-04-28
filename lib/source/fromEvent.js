/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var MulticastSource = require('@most/multicast').MulticastSource;
var EventTargetSource = require('./EventTargetSource');
var EventEmitterSource = require('./EventEmitterSource');

exports.fromEvent = fromEvent;

/**
 * Create a stream from an EventTarget, such as a DOM Node, or EventEmitter.
 * @param {String} event event type name, e.g. 'click'
 * @param {EventTarget|EventEmitter} source EventTarget or EventEmitter
 * @param {boolean?} useCapture for DOM events, whether to use
 *  capturing--passed as 3rd parameter to addEventListener.
 * @returns {Stream} stream containing all events of the specified type
 * from the source.
 */
function fromEvent(event, source /*, useCapture = false */) {
	var s;

	if(typeof source.addEventListener === 'function' && typeof source.removeEventListener === 'function') {
		var capture = arguments.length > 2 && !!arguments[2];
		s = new MulticastSource(new EventTargetSource(event, source, capture));
	} else if(typeof source.addListener === 'function' && typeof source.removeListener === 'function') {
		s = new EventEmitterSource(event, source);
	} else {
		throw new Error('source must support addEventListener/removeEventListener or addListener/removeListener');
	}

	return new Stream(s);
}
