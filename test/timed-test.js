require('buster').spec.expose();
var expect = require('buster').expect;

var timed = require('../lib/combinators/timed');
var filter = require('../lib/combinators/filter');
var reduce = require('../lib/combinators/reduce').reduce;
var Stream = require('../lib/Stream');
var flatMap = require('../lib/combinators/transform').flatMap;

var createTestScheduler = require('./createTestScheduler');

var sentinel = { value: 'sentinel' };

describe('delay', function() {
	it('should delay events by delayTime', function() {
		var scheduler = createTestScheduler();

		var result = timed.delayOn(scheduler, 100, Stream.of(sentinel))
			.observe(function(x) {
				expect(x).toBe(sentinel);
				expect(scheduler.now()).toBe(100);
			});

		scheduler.tick(100);
		return result;
	});
});

describe('periodic', function() {
	it('should emit events at tick periods', function() {
		var scheduler = createTestScheduler();

		var count = 5;
		var result = filter.take(count, timed.periodicOn(scheduler, 1))
			.reduce(function(c) {
				return c - 1;
			}, count).then(function(count) {
				expect(count).toBe(0);
			});

		scheduler.tick(10, 1);
		return result;
	});
});

describe('debounce', function() {
	describe('when events always occur less frequently than debounce period', function() {
		it('should be identity', function() {
			var scheduler = createTestScheduler();

			var count = 10;
			var debounced = timed.debounceOn(scheduler, 1, timed.periodicOn(scheduler, 2));
			var s = filter.take(count, debounced);

			var p = reduce(function(c) {
					return c - 1;
				}, count, s)
				.then(function(count) {
					expect(count).toBe(0);
				});

			scheduler.tick(3*count, 1);
			return p;
		});
	});

	describe('when events always occur more frequently than debounce period', function() {
		it('should be empty', function() {
			var scheduler = createTestScheduler();

			var times = [1,1,1,1,1];
			var elapsed = times.reduce(function(total, t) {
				return total + t;
			}, 0);

			var delays = flatMap(function(t) {
				return timed.delayOn(scheduler, t, Stream.of(t));
			}, Stream.from(times));

			var debounced = reduce(function(count) {
					return count + 1;
				}, 0, timed.debounceOn(scheduler, 2, delays))
				.then(function(count) {
					expect(count).toBe(0);
				});

			scheduler.tick(elapsed, 1);
			return debounced;
		});
	});

	it('should allow events that occur less frequently than debounce period', function() {
		var scheduler = createTestScheduler();

		var times = [1,1,2,1,1,2,1];
		var total = times.reduce(function(total, t) {
			total.elapsed += t;
			if(t === 2) {
				total.count += 1;
			}
			return total;
		}, { elapsed: 0, count: 0 });

		var delays = flatMap(function(t) {
			return timed.delayOn(scheduler, t, Stream.of(t));
		}, Stream.from(times));

		var debounced = reduce(function(count, x) {
				expect(x).toBe(1);
				return count + 1;
			}, 0, timed.debounceOn(scheduler, 2, delays))
			.then(function(count) {
				expect(count).toBe(total.count);
			});

		scheduler.tick(total.elapsed, 1);
		return debounced;
	});
});

describe('throttle', function() {
	it('should exclude items that are too frequent', function() {
		var scheduler = createTestScheduler();

		var result = timed.throttleOn(scheduler, 1, timed.periodicOn(scheduler, 1).take(5))
			.reduce(function(a, x) {
				return a.concat(x);
			}, [])
			.then(function(x) {
				expect(x).toEqual([0,2,4]);
			});

		scheduler.tick(10, 1);
		return result;
	});

	it('should include items beyond throttle window', function() {
		var scheduler = createTestScheduler();
		function identity(x) {
			return x;
		}

		var s = Stream.from([
			Stream.of('a'),
			timed.delayOn(scheduler, 1, Stream.of('z')),
			timed.delayOn(scheduler, 2, Stream.of('b'))
		]);
		var result = timed.throttleOn(scheduler, 1, flatMap(identity, s))
			.reduce(function(r, x) {
				return r+x;
			}, '')
			.then(function(r) {
				expect(r).toBe('ab');
			});

		scheduler.tick(10, 1);
		return result;
	});
});