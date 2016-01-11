require('buster').spec.expose();
var expect = require('buster').expect;

var fromIterable = require('../../lib/source/fromIterable').fromIterable;
var reduce = require('../../lib/combinator/accumulate').reduce;
var ArrayIterable = require('../helper/ArrayIterable');

describe('fromIterable', function() {

	it('should contain iterable items', function() {
		var input = [1,2,3];
		return reduce(function(a, x) {
			a.push(x);
			return a;
		}, [], fromIterable(new ArrayIterable(input))).then(function(result) {
			expect(result).toEqual(input);
		});
	});

});
