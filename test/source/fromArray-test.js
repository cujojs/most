require('buster').spec.expose();
var expect = require('buster').expect;

var fromArray = require('../../lib/source/fromArray').fromArray;
var observe = require('../../lib/combinator/observe').observe;

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

describe('from', function() {

	it('should contain array items', function() {
		var input = [1,2,3];
		var result = [];
		return observe(function(x) {
			result.push(x);
		}, fromArray([1,2,3])).then(function() {
			expect(result).toEqual(input);
		});
	});

});
