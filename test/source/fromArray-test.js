require('buster').spec.expose();
var expect = require('buster').expect;

var fromArray = require('../../lib/source/fromArray').fromArray;
var reduce = require('../../lib/combinator/accumulate').reduce;

describe('from', function() {

	it('should contain array items', function() {
		var input = [1,2,3];
		return reduce(function(a, x) {
			a.push(x);
			return a;
		}, [], fromArray(input)).then(function(result) {
			expect(result).toEqual(input);
		});
	});

});
