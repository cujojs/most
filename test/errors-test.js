require('buster').spec.expose();
var expect = require('buster').expect;

var error = require('../lib/combinator/errors');
var observe = require('../lib/combinator/observe').observe;
var streamOf = require('../lib/source/core').of;

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

function thrower(e) {
	throw e;
}

describe('throwError', function() {

	it('should create a Stream containing only an error', function() {

		return observe(function() {
			throw other;
		}, error.throwError(sentinel))
			['catch'](function(e) {
				expect(e).toBe(sentinel);
			});

	});

});

describe('flatMapError', function() {

	it('when an error is thrown should continue with returned stream', function() {

		var s = error.flatMapError(function () {
			return streamOf(sentinel);
		}, error.throwError(other));

		return observe(function(x) {
			expect(x).toBe(sentinel);
		}, s);

	});

	it('should only flat map first error if recovered stream also errors', function() {

		var s = error.flatMapError(function () {
			return error.throwError(sentinel);
		}, error.throwError(other));

		return observe(function() {}, s)
			['catch'](function(e) {
				expect(e).toBe(sentinel);
			});

	});
});