require('buster').spec.expose();
var expect = require('buster').expect;

var timed = require('../lib/combinators/timed');
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
		var result = timed.periodicOn(scheduler, 1)
			.take(count)
			.reduce(function(c) {
				return c - 1;
			}, count).then(function(count) {
				expect(count).toBe(0);
			});

		scheduler.tick(10, 1);
		return result;
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