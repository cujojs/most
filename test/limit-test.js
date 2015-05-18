require('buster').spec.expose();
var expect = require('buster').expect;

var limit = require('../lib/combinator/limit');
var periodic = require('../lib/source/periodic').periodic;
var create = require('../lib/source/create').create;
var delay = require('../lib/combinator/delay').delay;
var join = require('../lib/combinator/flatMap').join;
var zip = require('../lib/combinator/zip').zip;
var transform = require('../lib/combinator/transform');
var merge = require('../lib/combinator/merge').merge;
var take = require('../lib/combinator/slice').take;
var reduce = require('../lib/combinator/accumulate').reduce;
var observe = require('../lib/combinator/observe').observe;
var fromArray = require('../lib/source/fromArray').fromArray;
var core = require('../lib/source/core');

var empty = core.empty;
var streamOf = core.of;

var map = transform.map;
var constant = transform.constant;

var TestScheduler = require('./helper/TestScheduler');
var assertSame = require('./helper/stream-helper').assertSame;

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

describe('debounce', function() {
	describe('when events always occur less frequently than debounce period', function() {
		it('should be identity', function() {
			var s = take(5, periodic(2, sentinel));

			var debounced = limit.debounce(1, s);

			var scheduler = new TestScheduler();
			scheduler.tick(10);

			return scheduler.collect(debounced)
				.then(function(events) {
					expect(events.length).toBe(5);
				});
		});
	});

	describe('when events always occur more frequently than debounce period', function() {
		it('should be empty when source is empty', function() {
			var s = limit.debounce(1, empty());

			var scheduler = new TestScheduler();
			scheduler.tick(10);

			return scheduler.collect(s)
				.then(function(events) {
					expect(events.length).toBe(0);
				});
		});

		it('should be identity when source is singleton', function() {
			var s = limit.debounce(1, streamOf(sentinel));

			var scheduler = new TestScheduler();
			scheduler.tick(1);

			return scheduler.collect(s)
				.then(function(events) {
					expect(events.length).toBe(1);
					expect(events[0].time).toBe(0);
					expect(events[0].value).toBe(sentinel);
				});
		});

		it('should contain last event when source has many', function() {
			var a = [0,1,2,3,4,5,6,7,8,9];
			var n = a.length;
			var expected = a[n - 1];

			var s = take(10, map(function() {
				return a.shift();
			}, periodic(1)));

			var debounced = limit.debounce(n, s);

			var scheduler = new TestScheduler();
			scheduler.tick(n);

			return scheduler.collect(debounced)
				.then(function(events) {
					expect(events.length).toBe(1);
					expect(events[0].time).toBe(9);
					expect(events[0].value).toBe(expected);
				});
		});
	});

	it('should allow events that occur less frequently than debounce period', function() {
		var s = join(fromArray([
			delay(0, streamOf(other)),
			delay(1, streamOf(other)),
			delay(2, streamOf(sentinel)),

			delay(5, streamOf(other)),
			delay(6, streamOf(other)),
			delay(7, streamOf(sentinel))
		]));

		var scheduler = new TestScheduler();
		scheduler.tick(7);

		return scheduler.collect(limit.debounce(2, s))
			.then(function(events) {
				expect(events.length).toBe(2);
				expect(events[0].time).toBe(4);
				expect(events[0].value).toBe(sentinel);

				expect(events[1].time).toBe(7);
				expect(events[1].value).toBe(sentinel);
			});
	});
});

describe('throttle', function() {
	it('should exclude items that are too frequent', function() {

		var n = 10;
		var i = 0;
		var s = take(n, map(function() {
			return i++;
		}, periodic(1)));

		var throttled = limit.throttle(2, s);

		var scheduler = new TestScheduler();
		scheduler.tick(n);

		return scheduler.collect(throttled)
			.then(function(events) {
				expect(events).toEqual([
					{ time: 0, value: 0 },
					{ time: 2, value: 2 },
					{ time: 4, value: 4 },
					{ time: 6, value: 6 },
					{ time: 8, value: 8 }
				]);
			});
	});

	it('should be identity when period === 0 and all items are simultaneous', function() {
		var a = [0,1,2,3,4,5,6,7,8,9];
		var s = take(10, fromArray(a));
		return assertSame(s, limit.throttle(0, s));
	});

	it('should be identity when throttle period >= input period', function() {
		var n = 10;
		var s = take(n, periodic(1, sentinel));

		var scheduler = new TestScheduler();
		scheduler.tick(n);

		return scheduler.collect(zip(Array, s, limit.throttle(1, s)))
			.then(function(events) {
				events.forEach(function(event) {
					expect(event.value[0]).toEqual(event.value[1]);
				});
			});
	});

});