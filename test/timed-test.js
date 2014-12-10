require('buster').spec.expose();
var expect = require('buster').expect;

var delay = require('../lib/combinator/delay');
var filter = require('../lib/combinator/filter');
var reduce = require('../lib/combinator/accumulate').reduce;
var flatMap = require('../lib/combinator/join').flatMap;
var Stream = require('../lib/Stream');

var take = filter.take;

var sentinel = { value: 'sentinel' };

function identity(x) {
	return x;
}

describe('//delay', function() {
	it('should delay events by delayTime', function() {
		var scheduler = createTestScheduler();

		var dt = 100;

		var s = new Stream(identity, new Yield(0, sentinel, new End(0)), scheduler);
		s = timed.delay(dt, s);
		var result = s.step(s.state).then(function(iteration) {
			expect(iteration.value).toBe(sentinel);
			expect(iteration.time).toBe(dt);
			expect(scheduler.now()).toBe(dt);
		});

		scheduler.tick(100);
		return result;
	});
});

describe('//periodic', function() {
	it('should emit events at tick periods', function() {
		var scheduler = createTestScheduler();

		var count = 5;
		var result = reduce(function(c) {
			return c - 1;
		}, count, filter.take(count, timed.periodicOn(scheduler, 1)))
			.then(function(count) {
				expect(count).toBe(0);
			});

		scheduler.tick(10, 1);
		return result;
	});
});

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

describe('//throttle', function() {
	it('should exclude items that are too frequent', function() {
		var scheduler = createTestScheduler();

		var s = timed.throttleOn(scheduler, 1, take(5, timed.periodicOn(scheduler, 1)));

		var result = reduce(function(a, x) {
				return a.concat(x);
			}, [], s)
			.then(function(x) {
				expect(x).toEqual([0,2,4]);
			});

		scheduler.tick(10, 1);
		return result;
	});

	it('should include items beyond throttle window', function() {
		var scheduler = createTestScheduler();

		var s = Stream.from([
			new Stream(identity, new Yield(0, 'a', new End(0)), scheduler),
			new Stream(identity, new Yield(1, 'z', new End(1)), scheduler),
			new Stream(identity, new Yield(2, 'b', new End(2)), scheduler)
		]);

		var result = reduce(function(r, x) {
				return r+x;
			}, '', timed.throttle(1, flatMap(identity, s)))
			.then(function(r) {
				expect(r).toBe('ab');
			});

		scheduler.tick(10, 1);
		return result;
	});
});