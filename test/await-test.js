require('buster').spec.expose();
var expect = require('buster').expect;

var await = require('../lib/combinators/await').await;
var observe = require('../lib/combinators/observe').observe;
var Stream = require('../lib/Stream');
var resolve = require('../lib/promises').Promise.resolve;

var sentinel = { value: 'sentinel' };

function identity(x) {
	return x;
}

describe('await', function() {

	it('should await promises', function() {
		var s = await(Stream.of(resolve(sentinel)));

		return observe(function(x) {
			expect(x).toBe(sentinel);
		}, s);
	});

});
