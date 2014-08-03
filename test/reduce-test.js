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

describe('reduce1', function() {

	describe('when stream is empty', function() {

		it('should reject', function() {
			var spy = this.spy();
			return reduce.reduce1(spy, empty())
				.catch(function() {
					expect(spy).not.toHaveBeenCalled();
				});
		});

	});

	describe('when stream contains 1 item', function() {
		it('should reduce to that item', function() {
			return reduce.reduce1(function() {
				throw new Error();
			}, Stream.of(sentinel))
				.then(function(result) {
					expect(result).toBe(sentinel);
				});
		});
	});

	it('should reduce values, using first item as initial value', function() {
		return reduce.reduce1(function(s, x) {
			return s+x;
		}, Stream.from(['a', 'b', 'c', 'd']))
			.then(function(result) {
				expect(result).toBe('abcd');
			});
	});

});