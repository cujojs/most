require('buster').spec.expose();
var expect = require('buster').expect;

var monoid = require('../lib/combinators/monoid');
var reduce = require('../lib/combinators/reduce').reduce;
var Stream = require('../lib/Stream');

var streamHelper = require('./helper/stream-helper');
var makeStreamFromTimes = streamHelper.makeStreamFromTimes;
var createTestScheduler = streamHelper.createTestScheduler;

var sentinel = { value: 'sentinel' };

describe('empty', function() {
	it('should yield no items before end', function() {
		return monoid.empty().observe(function(x) {
			throw new Error('not empty ' + x);
		}).then(function() {
			expect(true).toBeTrue();
		});
	});
});

describe('concat', function() {

	it('should return a stream containing items from both streams in correct order', function() {
		var scheduler = createTestScheduler();

		var s1 = makeStreamFromTimes([3,4], 5, scheduler);
		var s2 = makeStreamFromTimes([1,2], 3, scheduler);

		var result = reduce(function(a, x) {
			return a.concat(x);
		}, [], monoid.concat(s1, s2)).then(function(a) {
			expect(a).toEqual([3,4,1,2]);
		});

		scheduler.tick(5);

		return result;
	});

	it('should satisfy left identity', function() {
		var s = monoid.concat(Stream.of(sentinel), monoid.empty());

		return s.reduce(function(count, x) {
			expect(x).toBe(sentinel);
			return count + 1;
		}, 0).then(function(count) {
			expect(count).toBe(1);
		});
	});

	it('should satisfy right identity', function() {
		var s = monoid.concat(monoid.empty(), Stream.of(sentinel));

		return s.reduce(function(count, x) {
			expect(x).toBe(sentinel);
			return count + 1;
		}, 0).then(function(count) {
			expect(count).toBe(1);
		});
	});

});