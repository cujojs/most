require('buster').spec.expose();
var expect = require('buster').expect;

var curry = require('../../lib/curry');

describe('curry', function() {

	it('should return same function when arity < 2', function() {
		function f(x) {}
		expect(curry(f)).toBe(f);
	});

	it('should return curried function when arity > 2', function() {
		function f(x, y) {}
		expect(curry(f)).not.toBe(f);
	});

	it('should return partially applyable functions', function() {
		function f(x, y) {
			return x + y;
		}

		var h = curry(f)(1);

		expect(typeof h).toBe('function');
		expect(h(2)).toBe(3);
	});
});