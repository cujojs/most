require('buster').spec.expose();
var expect = require('buster').expect;

var limit = require('../lib/combinator/limit');
var periodic = require('../lib/source/periodic').periodic;
var map = require('../lib/combinator/transform').map;
var take = require('../lib/combinator/slice').take;
var reduce = require('../lib/combinator/accumulate').reduce;
var observe = require('../lib/combinator/observe').observe;
var fromArray = require('../lib/source/fromArray').fromArray;

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

describe('//debounce', function() {
	describe('when events always occur less frequently than debounce period', function() {
		it('should be identity', function() {
			var scheduler = createTestScheduler();

			var times = [0,2,4,6,8];
			var s = makeStreamFromTimes(times, 10, scheduler);

			var result = reduce(function(count) {
				return count + 1;
			}, 0, timed.debounce(1, s))
				.then(function(count) {
					expect(count).toBe(times.length);
				});

			scheduler.tick(10, 1);
			return result;
		});
	});

	describe('when events always occur more frequently than debounce period', function() {
		it('should be empty', function() {
			var scheduler = createTestScheduler();

			var times = [1,2,3,4,5];
			var s = makeStreamFromTimes(times, 6, scheduler);

			var result = reduce(function(count) {
				return count + 1;
			}, 0, timed.debounce(1, s))
				.then(function(count) {
					expect(count).toBe(0);
				});

			scheduler.tick(6, 1);
			return result;
		});
	});

	it('should allow events that occur less frequently than debounce period', function() {
		var scheduler = createTestScheduler();

		var times = [0,1,2,4,5,6,8,9];
		var s = makeStreamFromTimes(times, 9, scheduler);

		var result = reduce(function(a, x) {
			return a.concat(x);
		}, [], timed.debounce(1, s))
			.then(function(a) {
				expect(a).toEqual([2,6]);
			});

		scheduler.tick(9, 1);
		return result;
	});
});

describe('throttle', function() {
	it('should exclude items that are too frequent', function() {

		var i = 0;
		var s = take(10, map(function() {
			return i++;
		}, periodic(1)));

		var throttled = limit.throttle(1, s);

		return reduce(function(a, x) {
			return a.concat(x);
		}, [], throttled)
			.then(function(x) {
				expect(x).toEqual([0,2,4,6,8]);
			});
	});
});