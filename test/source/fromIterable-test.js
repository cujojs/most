require('buster').spec.expose();
var expect = require('buster').expect;

var fromIterable = require('../../lib/source/fromIterable').fromIterable;
var observe = require('../../lib/combinator/observe').observe;
var ArrayIterable = require('../helper/ArrayIterable');

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

describe('fromIterable', function() {

	it('should contain iterable items', function() {
		var input = [1,2,3];
		var result = [];
		return observe(function(x) {
			result.push(x);
		}, fromIterable(new ArrayIterable(input))).then(function() {
			expect(result).toEqual(input);
		});
	});

});
