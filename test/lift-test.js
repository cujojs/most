require('buster').spec.expose();
var expect = require('buster').expect;

var lift = require('../lib/combinators/lift').lift;
var reduce = require('../lib/combinators/reduce').reduce;
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

		var fl = lift(f);
		var abc = fl(Stream.of('a'), Stream.of('b'), Stream.of('c'));


		return reduce(function(s, x) {
			return x;
		}, '', abc)
			.then(function(result) {
				expect(result).toBe(f('a', 'b', 'c'));
			});
	});
});
