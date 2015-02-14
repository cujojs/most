require('buster').spec.expose();
var expect = require('buster').expect;

var lift = require('../lib/combinator/lift').lift;
var periodic = require('../lib/source/periodic').periodic;
var take = require('../lib/combinator/slice').take;
var observe = require('../lib/combinator/observe').observe;
var streamOf = require('../lib/source/core').of;

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

		var a = periodic(1, 'a');
		var b = periodic(5, 'b');
		var c = streamOf('c');

		return observe(function(x) {
			expect(x).toBe(f('a', 'b', 'c'));
		}, take(3, lifted(a, b, c)));

	});
});
