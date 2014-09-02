require('buster').spec.expose();
var expect = require('buster').expect;

var error = require('../lib/combinators/error');
var observe = require('../lib/combinators/observe').observe;
var Stream = require('../lib/Stream');
var promise = require('../lib/promises');

var reject = promise.Promise.reject;
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
			return Stream.of(sentinel);
		}, new Stream(thrower, other));

		return observe(function(x) {
			expect(x).toBe(sentinel);
		}, s);

	});

	it('when a promise rejection is returned should continue with returned stream', function() {

		var s = error.flatMapError(function () {
			return Stream.of(sentinel);
		}, new Stream(reject, other));

		return observe(function(x) {
			expect(x).toBe(sentinel);
		}, s);

	});

	it('should only flat map first error if recovered stream also errors', function() {

		var s = error.flatMapError(function () {
			return new Stream(reject, sentinel);
		}, new Stream(reject, other));

		return observe(function() {}, s)
			['catch'](function(e) {
				expect(e).toBe(sentinel);
			});

	});
});