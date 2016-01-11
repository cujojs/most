require('buster').spec.expose();
var expect = require('buster').expect;

var slice = require('../lib/combinator/slice');
var fromArray = require('../lib/source/fromArray').fromArray;
var reduce = require('../lib/combinator/accumulate').reduce;

describe('slice', function() {
	it('should skip first n elements', function () {
		var a = [1, 1, 1, 1, 1, 1, 1];
		var s = slice.slice(2, a.length-2, fromArray(a));

		return reduce(function (count) {
			return count + 1;
		}, 0, s)
			.then(function (count) {
				expect(count).toBe(a.length - 4);
			});
	});
});

describe('take', function() {
	it('should take first n elements', function () {
		var s = slice.take(2, fromArray([1,1,1,1,1,1,1]));

		return reduce(function (count) {
			return count + 1;
		}, 0, s)
			.then(function (count) {
				expect(count).toBe(2);
			});
	});
});

describe('skip', function() {
	it('should skip first n elements', function () {
		var a = [1, 1, 1, 1, 1, 1, 1];
		var s = slice.skip(2, fromArray(a));

		return reduce(function (count) {
			return count + 1;
		}, 0, s)
			.then(function (count) {
				expect(count).toBe(a.length - 2);
			});
	});
});

describe('takeWhile', function() {
	it('should take elements until condition becomes false', function() {
		var a = [0,1,2,3,4,5,6,7,8,9];
		var s = slice.takeWhile(function(x) {
			return x < 5;
		}, fromArray(a));

		return reduce(function(count, x) {
			expect(x).toBeLessThan(5);
			return count + 1;
		}, 0, s)
			.then(function(count) {
				expect(count).toBe(5);
			});
	});
});

describe('skipWhile', function() {
	it('should skip elements until condition becomes false', function() {
		var a = [0,1,2,3,4,5,6,7,8,9];
		var s = slice.skipWhile(function(x) {
			return x < 5;
		}, fromArray(a));

		return reduce(function(count, x) {
			expect(x >= 5).toBeTrue();
			return count + 1;
		}, 0, s)
			.then(function(count) {
				expect(count).toBe(5);
			});
	});
});
