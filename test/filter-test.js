require('buster').spec.expose();
var expect = require('buster').expect;

var filter = require('../lib/combinators/filter');
var build = require('../lib/combinators/build');
var reduce = require('../lib/combinators/reduce').reduce;
var observe = require('../lib/combinators/observe').observe;
var Stream = require('../lib/Stream');

var iterate = build.iterate;
var repeat = build.repeat;

var step = require('../lib/step');
var Yield = step.Yield;
var End = step.End;

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

function identity(x) {
	return x;
}

describe('filter', function() {
	it('should return a stream containing only allowed items', function() {
		var s = Stream.from([sentinel, other, sentinel, other]);

		return filter.filter(function(x) {
			return x === sentinel;
		}, s).observe(function(x) {
			expect(x).toBe(sentinel);
		});
	});
});

describe('takeUntil', function() {
	it('should only contain events earlier than signal', function() {

		var times = [0, 1, 2, 3, 4, 5];
		var steps = times.reduceRight(function(step, t) {
			return new Yield(t, t, step);
		}, new End(times[times.length-1] + 1));

		var stream = new Stream(identity, steps);
		var signal = new Stream(identity, new Yield(3));

		return observe(function(x) {
			expect(x).toBeLessThan(3);
		}, filter.takeUntil(signal, stream));
	});

	it('should dispose source stream', function() {

		var times = [0, 1, 2];
		var steps = times.reduceRight(function(step, t) {
			return new Yield(t, t, step);
		}, new End(times[times.length-1] + 1));

		var dispose = this.spy();
		var stream = new Stream(identity, steps, void 0, dispose);
		var signal = new Stream(identity, new Yield(1));

		return observe(function() {},
			filter.takeUntil(signal, stream))
			.then(function() {
				expect(dispose).toHaveBeenCalledOnce();
			});

	});
});

describe('take', function() {
	it('should take first n elements', function () {
		var stream = filter.take(2, repeat(sentinel));

		return reduce(function (count) {
				return count + 1;
			}, 0, stream)
			.then(function (count) {
				expect(count).toBe(2);
			});
	});
});

describe('takeWhile', function() {
	it('should take elements until condition becomes false', function() {
		var stream = filter.takeWhile(function (x) {
			return x < 10;
		}, iterate(function (x) {
			return x + 1;
		}, 0));

		return reduce(function(count, x) {
				expect(x).toBeLessThan(10);
				return count + 1;
			}, 0, stream)
			.then(function(count) {
				expect(count).toBe(10);
			});
	});

});

describe('filter', function() {

	it('should return a stream with adjacent duplicates removed', function() {
		var stream = filter.distinct(Stream.from([1, 2, 2, 3, 4, 4]));
		return reduce(function(a, x) {
				a.push(x);
				return a;
			}, [], stream)
			.then(function(a) {
				expect(a).toEqual([1,2,3,4]);
			});
	});

});

describe('distinctBy', function() {

	it('should use provided comparator to remove adjacent duplicates', function() {
		function eq(a, b) {
			return a.toLowerCase() === b.toLowerCase();
		}

		var stream = filter.distinctBy(eq, Stream.from(['a', 'b', 'B', 'c', 'D', 'd']));
		return reduce(function(a, x) {
				a.push(x);
				return a;
			}, [], stream)
			.then(function(a) {
				expect(a).toEqual(['a', 'b', 'c', 'D']);
			});
	});

});
