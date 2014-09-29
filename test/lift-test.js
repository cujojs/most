require('buster').spec.expose();
var expect = require('buster').expect;
var assertSame = require('./helper/stream-helper').assertSame;

var lift = require('../lib/combinators/lift').lift;
var observe = require('../lib/combinators/observe').observe;
var transform = require('../lib/combinators/transform');
var map = transform.map;
var flatMap = transform.flatMap;
var Stream = require('../lib/Stream');

describe('lift', function() {
	it('should return function with same arity', function() {
		expect(lift(function() {}).length).toBe(0);
		expect(lift(function(x) {}).length).toBe(1);
		expect(lift(function(x, y) {}).length).toBe(2);
		expect(lift(function(x, y, z) {}).length).toBe(3);
	});

	it('should return function with a reasonable name', function() {
		function aTestFunction() {}
		expect(lift(aTestFunction).name.indexOf(aTestFunction.name)).toBeGreaterThan(-1);
	});

	it('should lift function to operate on streams', function() {
		function f(x, y, z) {
			return x + y + z;
		}

		var lifted = lift(f);

		var a = Stream.of('a');
		var b = Stream.of('b');
		var c = Stream.of('c');

		return assertSame(
			lifted(a, b, c),
			flatMap(function(a) {
				return flatMap(function(b) {
					return map(function(c) {
						return f(a, b, c);
					}, c);
				}, b);
			}, a)
		);
	});
});
