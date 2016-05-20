require('buster').spec.expose();
var assert = require('buster').referee.assert;

var Stream = require('../../lib/Stream');
var from = require('../../lib/source/from').from;
var observe = require('../../lib/combinator/observe').observe;

describe('from', function() {

	it('should be identity for own streams', function() {
		var s = new Stream({ run: function() {} });
		assert.same(s, from(s));
	});

	it('should support array-like items', function() {
		function observeArguments(){
			var result = [];
			return observe(function(x) {
				result.push(x);
			}, from(arguments)).then(function() {
				assert.equals(result, [1,2,3]);
			});
		}
		return observeArguments(1,2,3);
	});

});
