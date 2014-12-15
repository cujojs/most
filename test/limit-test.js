require('buster').spec.expose();
var expect = require('buster').expect;

var limit = require('../lib/combinator/limit');
var periodic = require('../lib/source/periodic').periodic;
var delay = require('../lib/combinator/delay').delay;
var transform = require('../lib/combinator/transform');
var merge = require('../lib/combinator/merge').merge;
var flatMap = require('../lib/combinator/join').flatMap;
var take = require('../lib/combinator/slice').take;
var reduce = require('../lib/combinator/accumulate').reduce;
var observe = require('../lib/combinator/observe').observe;
var fromArray = require('../lib/source/fromArray').fromArray;
var empty = require('../lib/source/core').empty;

var map = transform.map;
var constant = transform.constant;

var assertSame = require('./helper/stream-helper').assertSame;

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

describe('debounce', function() {
	describe('when events always occur less frequently than debounce period', function() {
		it('should be identity', function() {
			var a = [0,1,2,3,4,5,6,7,8,9];
			var expected = a.slice(0, -1);

			var s = take(10, map(function() {
				return a.shift();
			}, periodic(10)));

			var debounced = limit.debounce(1, s);

			return reduce(function(a, x) {
				return a.concat(x);
			}, [], debounced)
				.then(function(array) {
					expect(array).toEqual(expected);
				});
		});
	});

	describe('when events always occur more frequently than debounce period', function() {
		it('should be empty', function() {
			var a = [0,1,2,3,4,5,6,7,8,9];
			var expected = [];

			var s = take(10, map(function() {
				return a.shift();
			}, periodic(1)));

			var debounced = limit.debounce(10, s);

			return reduce(function(a, x) {
				return a.concat(x);
			}, [], debounced)
				.then(function(array) {
					expect(array).toEqual(expected);
				});
		});
	});

	it('should allow events that occur less frequently than debounce period', function() {

		var s1 = constant(1, periodic(30));
		var s2 = delay(10, constant(0, periodic(30)));

		// s: 10-10-10-10->

		var s = take(5, limit.debounce(15, merge(s1, s2)));

		return observe(function(x) {
			expect(x).toBe(0);
		}, s);
	});
});

describe('throttle', function() {
	it('should exclude items that are too frequent', function() {

		var i = 0;
		var s = take(10, map(function() {
			return i++;
		}, periodic(1)));

		var throttled = limit.throttle(2, s);

		return reduce(function(a, x) {
			return a.concat(x);
		}, [], throttled)
			.then(function(x) {
				expect(x).toEqual([0,2,4,6,8]);
			});
	});

	it('should be identity when period === 0 and all items are simultaneous', function() {
		var a = [0,1,2,3,4,5,6,7,8,9];
		var s = take(10, fromArray(a));

		return assertSame(s, limit.throttle(0, s));
	});

	it('should be identity when throttle period >= input period', function() {
		var s = take(10, periodic(1));
		return assertSame(s, limit.throttle(1, s));
	});

});