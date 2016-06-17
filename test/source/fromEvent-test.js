require('buster').spec.expose();
var expect = require('buster').expect;

var events = require('../../lib/source/fromEvent');
var fromEvent = events.fromEvent;
var reduce = require('../../lib/combinator/accumulate').reduce;
var drain = require('../../lib/combinator/observe').drain;
var observe = require('../../lib/combinator/observe').observe;
var take = require('../../lib/combinator/slice').take;
var FakeEventTarget = require('../helper/FakeEventTarget');
var FakeEventEmitter = require('../helper/FakeEventEmitter');

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

		it('should propagate event synchronously', function() {
			var tick = 0;
			var source = new FakeEventTarget();
			var s = fromEvent('test', source);

			setTimeout(function() {
				tick = 1;
				source.emit(sentinel);
				tick = 2;
			}, 0);

			return observe(function() {
				expect(tick).toBe(1);
			}, take(1, s));
		});

		it('should pass capture argument', () => {
			var source = new FakeEventTarget();

			const expected = {};
			drain(take(1, fromEvent('test', source, expected)));
			source.emit('unused');

			expect(source._capture).toBe(expected);
		})

		it('should pass false if capture not provided', () => {
			var source = new FakeEventTarget();

			drain(take(1, fromEvent('test', source)));
			source.emit('unused');

			expect(source._capture).toBe(false);
		})
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

function randomBoolean() {
	return Math.random() >= 0.5;
}

function testEvents(verify, values, source, stream) {
	setTimeout(function () {
		values.forEach(function (x) {
			source.emit(x);
		});
	}, 0);

	return reduce(function(count, x) {
		verify(x);
		return count+1;
	}, 0, stream);
}

function verifyContainsEmittedItems (evented) {
	var values = [sentinel, sentinel, sentinel];
	var stream = take(values.length, fromEvent('event', evented, randomBoolean()));

	return testEvents(function (x) {
		expect(x).toBe(sentinel);
	}, values, evented, stream).then(function(count) {
		expect(count).toBe(values.length);
	});
}

function verifyUnlistenOnEnd (evented) {
	var spy = spyOnRemove(this, evented);
	var values = [sentinel, sentinel, sentinel];

	var stream = take(1, fromEvent('event', evented, randomBoolean()));

	return testEvents(function(x) {
		expect(x).toBe(sentinel);
	}, values, evented, stream).then(function (count) {
		expect(count).toBe(1);
	}).then(function() {
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
