require('buster').spec.expose();
var expect = require('buster').expect;

var most = require('../most');
var sentinel = { value: 'sentinel' };

describe('cycle', function() {

	it('should keep repeating', function() {
		return most.from([1, 2, 3]).cycle()
			.take(9)
			.reduce(function(result, x) {
				return result.concat(x);
			}, []).then(function(result) {
				expect(result).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3]);
			});
	});

	it('should end on error', function() {
		return most.from([1, 2, 3]).cycle()
			.observe(function() { throw sentinel; }).catch(function(e) {
				expect(e).toBe(sentinel);
			});
	});
});

