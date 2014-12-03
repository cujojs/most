require('buster').spec.expose();
var expect = require('buster').expect;

var filter = require('../lib/combinator/filter');
var reduce = require('../lib/combinator/accumulate').reduce;
var observe = require('../lib/combinator/observe').observe;
var fromArray = require('../lib/source/fromArray').fromArray;

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

describe('filter', function() {
	it('should return a stream containing only allowed items', function() {
		var s = fromArray([sentinel, other, sentinel, other]);

		return observe(function(x) {
			expect(x).toBe(sentinel);
		}, filter.filter(function(x) {
			return x === sentinel;
		}, s));
	});
});

describe('distinct', function() {

	it('should return a stream with adjacent duplicates removed', function() {
		var stream = filter.distinct(fromArray([1, 2, 2, 3, 4, 4]));
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

		var stream = filter.distinctBy(eq, fromArray(['a', 'b', 'B', 'c', 'D', 'd']));
		return reduce(function(a, x) {
				a.push(x);
				return a;
			}, [], stream)
			.then(function(a) {
				expect(a).toEqual(['a', 'b', 'c', 'D']);
			});
	});

});
