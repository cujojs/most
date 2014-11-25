require('buster').spec.expose();
var expect = require('buster').expect;

var Stream = require('../lib/Stream');
var reduce = require('../lib/combinators/reduce');

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

function empty() {
	return new Stream(function() {
		return new Stream.End();
	});
}

describe('reduce', function() {

	describe('when stream is empty', function() {

		it('should reduce to initial', function() {
			return reduce.reduce(function() {
				throw new Error();
			}, sentinel, empty())
				.then(function(result) {
					expect(result).toBe(sentinel);
				});
		});

	});

	describe('when stream errors', function() {

		it('should reject', function() {
			var errorStream = new Stream(function(e) {
				throw e;
			}, sentinel);

			return reduce.reduce(function(x) {
				return x;
			}, other, errorStream)
				.catch(function(e) {
					expect(e).toBe(sentinel);
				});
		});

	});

	it('should reduce values', function() {
		return reduce.reduce(function(s, x) {
			return s+x;
		}, 'a', Stream.from(['b', 'c', 'd']))
			.then(function(result) {
				expect(result).toBe('abcd');
			});
	});

});