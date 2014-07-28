require('buster').spec.expose();
var expect = require('buster').expect;

var timed = require('../lib/combinators/timed');
var Stream = require('../lib/Stream');

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

describe('debounce', function() {
	it('should exclude items during debounce period', function() {
		var scheduler = createTestScheduler();

		var result = timed.debounceOn(scheduler, 1, timed.periodicOn(scheduler, 1).take(5))
			.observe(function(x) {
				expect(x % 2 === 0).toBeTrue();
			});

		scheduler.tick(10, 1);
		return result;
	});
});