require('buster').spec.expose();
var expect = require('buster').expect;

var fromEvent = require('../../lib/source/fromEvent').fromEvent;
var observe = require('../../lib/combinators/observe').observe;
var take = require('../../lib/combinators/filter').take;
var FakeEventTarget = require('./FakeEventTarget');
var FakeEventEmitter = require('./FakeEventEmitter');

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

describe('fromEvent', function() {

	describe('given an EventTarget', function() {

		it('should contain emitted items', function() {
			return verifyContainsEmittedItems(new FakeEventTarget());
		});

		it('should unlisten on end', function() {
			return verifyUnlistenOnEnd.call(this, new FakeEventTarget());
		});

	});

	describe('given an EventEmitter', function() {

		it('should contain emitted items', function() {
			return verifyContainsEmittedItems(new FakeEventEmitter());
		});

		it('should unlisten on end', function() {
			return verifyUnlistenOnEnd.call(this, new FakeEventEmitter());
		});

		it('should convert multiple arguments to array', function() {
			var evented = new FakeEventEmitter();
			var values = [sentinel, other, 1];

			var s = take(1, fromEvent('event', evented));

			setTimeout(function () {
				evented.emit.apply(evented, values);
			}, 0);

			return observe(function (array) {
				expect(array).toEqual(values);
			}, s);
		});

	});

});

function verifyContainsEmittedItems (evented) {
	var values = [sentinel, sentinel, sentinel];
	var count = 0;

	var s = take(values.length, fromEvent('event', evented));

	setTimeout(function () {
		values.forEach(function () {
			evented.emit(sentinel);
		});
	}, 0);

	return observe(function (x) {
		expect(x).toBe(sentinel);
		count++;
	}, s).then(function () {
		expect(count).toBe(values.length);
	});
}

function verifyUnlistenOnEnd (evented) {
	var spy = spyOnRemove(this, evented);
	var values = [sentinel, sentinel, sentinel];
	var count = 0;

	var s = take(1, fromEvent('event', evented));

	setTimeout(function () {
		values.forEach(function () {
			evented.emit(sentinel);
		});
	}, 0);

	return observe(function (x) {
		expect(x).toBe(sentinel);
		count++;
	}, s).then(function () {
		expect(count).toBe(1);
		expect(spy).toHaveBeenCalled();
	});
}

function spyOnRemove(context, evented) {
	var spy;
	if(typeof evented.removeEventListener === 'function') {
		spy = context.spy(evented.removeEventListener);
		evented.removeEventListener = spy;
		return spy;
	}

	if(typeof evented.removeListener === 'function') {
		spy = context.spy(evented.removeListener);
		evented.removeListener = spy;
		return spy;
	}

	throw new Error('Unsupported event emitter type');
}