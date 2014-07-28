require('buster').spec.expose();
var expect = require('buster').expect;

var distinct = require('../lib/combinators/distinct');
var Stream = require('../lib/Stream');

describe('distinct', function() {

	it('should return a stream with adjacent duplicates removed', function() {
		return distinct.distinct(Stream.from([1, 2, 2, 3, 4, 4]))
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

		return distinct.distinctBy(eq, Stream.from(['a', 'b', 'B', 'c', 'D', 'd']))
			.reduce(function(a, x) {
				a.push(x);
				return a;
			}, []).then(function(a) {
				expect(a).toEqual(['a', 'b', 'c', 'D']);
			});
	});

});
