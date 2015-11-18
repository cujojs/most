require('buster').spec.expose();
var expect = require('buster').expect;

var from = require('../../lib/source/from').from;
var observe = require('../../lib/combinator/observe').observe;

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

describe('from', function() {

	it('should support array-like items', function() {
		function observeArguments(){
			var result = [];
			return observe(function(x) {
				result.push(x);
			}, from(arguments)).then(function() {
				expect(result).toEqual(result);
			});
		}
		return observeArguments(1,2,3);
	});

});
