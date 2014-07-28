require('buster').spec.expose();
var expect = require('buster').expect;

var filter = require('../lib/combinators/filter');
var build = require('../lib/combinators/build');
var iterate = build.iterate;
var repeat = build.repeat;
var Stream = require('../lib/Stream');

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

describe('filter', function() {
	it('should return a stream containing only allowed items', function() {
		return filter.filter(function(x) {
			return x === sentinel;
		}, Stream.from([sentinel, other])).observe(function(x) {
			expect(x).toBe(sentinel);
		});
	});

	it('should filter an infinite stream', function() {
		return filter.filter(function(x) {
			return x % 2 === 0;
		}, iterate(function(x) {return x+1;}, 0))
			.observe(function(x) {
				expect(x % 2 === 0).toBeTrue();
				if(x > 10) {
					return new Stream.End();
				}
			});
	});
});

describe('take', function() {
	it('should take first n elements', function () {
		return filter.take(2, repeat(sentinel))
			.reduce(function (count) {
				return count + 1;
			}, 0).then(function (count) {
				expect(count).toBe(2);
			});
	});
});

describe('takeWhile', function() {
	it('should take elements until condition becomes false', function() {
		return filter.takeWhile(function(x) {
			return x < 10;
		}, iterate(function(x) {
			return x + 1;
		}, 0))
			.reduce(function(count, x) {
				expect(x).toBeLessThan(10);
				return count + 1;
			}, 0).then(function(count) {
				expect(count).toBe(10);
			});
	});

});

describe('filter', function() {

	it('should return a stream with adjacent duplicates removed', function() {
		return filter.distinct(Stream.from([1, 2, 2, 3, 4, 4]))
			.reduce(function(a, x) {
				a.push(x);
				return a;
			}, []).then(function(a) {
				expect(a).toEqual([1,2,3,4]);
			});
	});

});

describe('distinctBy', function() {

	it('should use provided comparator to remove adjacent duplicates', function() {
		function eq(a, b) {
			return a.toLowerCase() === b.toLocaleLowerCase();
		}

		return filter.distinctBy(eq, Stream.from(['a', 'b', 'B', 'c', 'D', 'd']))
			.reduce(function(a, x) {
				a.push(x);
				return a;
			}, []).then(function(a) {
				expect(a).toEqual(['a', 'b', 'c', 'D']);
			});
	});

});
