require('buster').spec.expose();
var expect = require('buster').expect;

var slice = require('../lib/combinator/slice');
var map = require('../lib/combinator/transform').map;
var Map = require('../lib/fusion/Map');
var fromArray = require('../lib/source/fromArray').fromArray;
var reduce = require('../lib/combinator/accumulate').reduce;

var expectArray = require('./helper/stream-helper').expectArray;

describe('slice', function() {
	describe('fusion', function() {
		it('should narrow when second slice is smaller', function() {
			var s = slice.slice(1, 5, slice.slice(1, 10, fromArray([1])));
			expect(s.source.min).toBe(2);
			expect(s.source.max).toBe(6);
		});

		it('should narrow when second slice is larger', function() {
			var s = slice.slice(1, 10, slice.slice(1, 5, fromArray([1])));
			expect(s.source.min).toBe(2);
			expect(s.source.max).toBe(5);
		});

		it('should commute map', function() {
			function id(x) {
				return x;
			}
			var s = slice.slice(0, 3, map(id, fromArray([1, 2, 3, 4])));

			expect(s.source instanceof Map).toBe(true);
			expect(s.source.f).toBe(id);
			return expectArray([1, 2, 3], s);
		});
	});

	it('should retain only sliced range', function () {
		var a = [1, 2, 3, 4, 5, 6, 7, 8, 9];
		var s = slice.slice(2, a.length-2, fromArray(a));
		return expectArray(a.slice(2, a.length-2), s);
	});
});

describe('take', function() {
	it('should take first n elements', function () {
		var s = slice.take(2, fromArray([1 ,1, 1, 1, 1, 1, 1]));
		return expectArray([1, 1], s);
	});
});

describe('skip', function() {
	it('should skip first n elements', function () {
		var a = [1, 1, 1, 1, 1, 1, 1];
		var s = slice.skip(2, fromArray(a));
		return expectArray(a.slice(2), s)
	});
});

describe('takeWhile', function() {
	it('should take elements until condition becomes false', function() {
		var a = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
		var s = slice.takeWhile(function(x) {
			return x < 5;
		}, fromArray(a));

		return expectArray([0, 1, 2, 3, 4], s);
	});
});

describe('skipWhile', function() {
	it('should skip elements until condition becomes false', function() {
		var a = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
		var s = slice.skipWhile(function(x) {
			return x < 5;
		}, fromArray(a));

		return expectArray([5, 6, 7, 8, 9], s)
	});
});
