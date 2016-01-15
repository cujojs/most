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
var observe = require('../lib/combinator/observe').observe;
var fromArray = require('../lib/source/fromArray').fromArray;
var core = require('../lib/source/core');

var empty = core.empty;
var streamOf = core.of;

var map = transform.map;

var te = require('./helper/testEnv');
var assertSame = require('./helper/stream-helper').assertSame;

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

describe('debounce', function() {
	describe('when events always occur less frequently than debounce period', function() {
		it('should be identity', function() {
			var n = 5;
			var period = 2;
			var s = take(n, periodic(period, sentinel));

			var debounced = limit.debounce(1, s);

			return te.collectEvents(debounced, te.ticks(n*period))
				.then(function(events) {
					expect(events.length).toBe(5);
				});
		});
	});

	describe('when events always occur more frequently than debounce period', function() {
		it('should be empty when source is empty', function() {
			var s = limit.debounce(1, empty());

			return te.collectEvents(s, te.ticks(1))
				.then(function(events) {
					expect(events.length).toBe(0);
				});
		});

		it('should be identity when source is singleton', function() {
			var s = limit.debounce(1, streamOf(sentinel));

			return te.collectEvents(s, te.ticks(2))
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

			return te.collectEvents(debounced, te.ticks(n))
				.then(function(events) {
					expect(events).toEqual([{ time: 9, value: expected }]);
				});
		});
	});

	it('should allow events that occur less frequently than debounce period', function() {
		var s = te.atTimes([
			{ time: 0, value: 0 },
			{ time: 1, value: 0 },
			{ time: 2, value: 1 },
			// leave enough time for debounce period
			{ time: 5, value: 0 },
			{ time: 6, value: 0 },
			{ time: 7, value: 2 }
		]);

		return te.collectEvents(limit.debounce(2, s), te.ticks(8))
			.then(function(events) {
				expect(events).toEqual([
					{ time: 4, value: 1 },
					{ time: 7, value: 2 }
				]);
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

		return te.collectEvents(throttled, te.ticks(n))
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
		var a = [0,1,2,3,4,5,6,7,8,9];
		var p = take(a.length, periodic(1));

		var i1 = 0;
		var s1 = map(function() {
			return a[i1++];
		}, p);

		var i2 = 0;
		var s2 = limit.throttle(1, map(function() {
			return a[i2++];
		}, p));

		var zipped = zip(Array, s1, s2);

		return te.collectEvents(zipped, te.ticks(a.length))
			.then(function(pairs) {
				pairs.forEach(function(pair) {
					expect(pair[0]).toEqual(pair[1]);
				});
			});
	});

});
