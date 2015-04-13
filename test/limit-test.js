require('buster').spec.expose();
var expect = require('buster').expect;

var limit = require('../lib/combinator/limit');
var periodic = require('../lib/source/periodic').periodic;
var create = require('../lib/source/create').create;
var delay = require('../lib/combinator/delay').delay;
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

var assertSame = require('./helper/stream-helper').assertSame;

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

describe('debounce', function() {
	describe('when events always occur less frequently than debounce period', function() {
		it('should be identity', function() {
			var s = take(5, periodic(20, sentinel));

			var debounced = limit.debounce(10, s);

			return reduce(function(count) {
				return count + 1;
			}, 0, debounced)
				.then(function(count) {
					expect(count).toBe(5);
				});
		});
	});

	describe('when events always occur more frequently than debounce period', function() {
		it('should be empty when source is empty', function() {
			var s = limit.debounce(10, empty());
			return reduce(function(x) {
				return x + 1;
			}, 0, s)
				.then(function(x) {
					expect(x).toBe(0);
				});
		});

		it('should be identity when source is singleton', function() {
			var s = limit.debounce(10, streamOf(sentinel));
			return reduce(function(a, x) {
				return a.concat(x);
			}, [], s)
				.then(function(x) {
					expect(x).toEqual([sentinel]);
				});
		});

		it('should contain last event when source has many', function() {
			var a = [0,1,2,3,4,5,6,7,8,9];
			var expected = a.slice(a.length - 1);

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
		var s = create(function(add, end) {
			setTimeout(addOther,     0);
			setTimeout(addOther,    10);
			setTimeout(addSentinel, 20);

			setTimeout(addOther,    50);
			setTimeout(addOther,    60);
			setTimeout(addSentinel, 70);

			setTimeout(end, 80);

			function addSentinel() {
				add(sentinel);
			}

			function addOther() {
				add(other);
			}
		});

		return observe(function(x) {
			expect(x).toBe(sentinel);
		}, limit.debounce(15, s));
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