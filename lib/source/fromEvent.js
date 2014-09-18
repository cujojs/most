/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Stream = require('../Stream');
var MulticastSource = require('./MulticastSource');
var fromSource = require('./fromSource');
var copy = require('../base').copy;

exports.fromEventWhere = fromEventWhere;
exports.fromEvent = fromEvent;

/**
 * Create a stream of events from the supplied EventTarget or EventEmitter
 * @param {function(event:*)} predicate filtering predicate call for each source event.
 *  If it returns `false`, the event will NOT be added to the stream.
 *  If it returns any other value (including falsy, eg undefined), the event will be added
 * @param {String} name event name, e.g. 'click'
 * @param {EventTarget|EventEmitter} source EventTarget or EventEmitter. The source
 *  must support either addEventListener/removeEventListener (w3c EventTarget:
 *  http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventTarget),
 *  or addListener/removeListener (node EventEmitter: http://nodejs.org/api/events.html)
 * @returns {Stream} stream of events of the specified type from the source
 */
function fromEventWhere(predicate, name, source) {
	return fromSource(createMulticastSource(function(add) {
		return subscribe(name, source, addWhere);

		function addWhere(e) {
			if(predicate(e) !== false) {
				add(e);
			}
		}
	}));
}

/**
 * Create a stream of events from the supplied EventTarget or EventEmitter
 * @param {String} name event name, e.g. 'click'
 * @param {EventTarget|EventEmitter} source EventTarget or EventEmitter. The source
 *  must support either addEventListener/removeEventListener (w3c EventTarget:
 *  http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventTarget),
 *  or addListener/removeListener (node EventEmitter: http://nodejs.org/api/events.html)
 * @returns {Stream} stream of events of the specified type from the source
 */
function fromEvent(name, source) {
	return fromSource(createMulticastSource(function(add) {
		return subscribe(name, source, add);
	}));
}

function createMulticastSource(run) {
	return new MulticastSource(Stream.getDefaultScheduler(), run);
}

function subscribe(event, source, add) {
	if(typeof source.addEventListener === 'function') {
		return subscribeEventTarget(source, event, add);
	}

	if(typeof source.addListener === 'function') {
		return subscribeEventEmitter(source, event, add);
	}

	throw new Error('source must support add/removeEventListener or add/removeListener');
}

function subscribeEventTarget (source, event, add) {
	source.addEventListener(event, add, false);
	return function () {
		source.removeEventListener(event, add, false);
	};
}

function subscribeEventEmitter (source, event, add) {
	source.addListener(event, addVarargs);
	return function () {
		source.removeListener(event, addVarargs);
	};

	// EventEmitter supports varargs (eg: emitter.emit('event', a, b, c, ...)) so
	// have to support it here by turning into an array
	function addVarargs(a) {
		return arguments.length > 1 ? add(copy(arguments)) : add(a);
	}
}
