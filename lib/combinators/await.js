/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var promise = require('../promises');
var step = require('../step');

var when = promise.when;

var Yield = step.Yield;
var End = step.End;

exports.await = await;

/**
 * Await promises, turning a Stream<Promise<X>> into Stream<X>.  Preserves
 * event order, but timeshifts events based on promise resolution time.
 * @param {Stream<Promise<X>>} stream stream whose values are promises
 * @returns {Stream<X>} stream containing non-promise values
 */
function await(stream) {
	var stepper = stream.step;
	var scheduler = stream.scheduler;

	return stream.beget(function(s) {
		return stepAwait(scheduler, stepper, s);
	}, stream.state);
}

function stepAwait (scheduler, stepper, s) {
	return when(function (i) {
		return i.done ? new End(scheduler.now(), i.value, i.state)
			 : awaitValue(scheduler, i.value, i.state);
	}, when(stepper, s));
}

function awaitValue (scheduler, promise, state) {
	return promise.then(function(x) {
		return new Yield(scheduler.now(), x, state);
	});
}
