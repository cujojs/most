require('buster').spec.expose();
var expect = require('buster').expect;

var error = require('../lib/combinator/errors');
var map = require('../lib/combinator/transform').map;
var observe = require('../lib/combinator/observe').observe;
var just = require('../lib/source/core').of;

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

describe('throwError', function() {

	it('should create a Stream containing only an error', function() {

		return observe(function() {
			throw other;
		}, error.throwError(sentinel))
			.catch(function(e) {
				expect(e).toBe(sentinel);
			});
	});

});

describe('recoverWith', function() {

	it('when an error is thrown should continue with returned stream', function() {

		var s = error.recoverWith(function () {
			return just(sentinel);
		}, error.throwError(other));

		return observe(function(x) {
			expect(x).toBe(sentinel);
		}, s);

	});

	it('should recover from errors before recoverError', function() {
		var s = map(function() {
			throw new Error();
		}, just(other));

		return observe(function(x) {
			expect(x).toBe(sentinel);
		}, error.recoverWith(function() {
			return just(sentinel);
		}, s));
	});

	it('should not recover from errors after recoverError', function() {
		var s = error.recoverWith(function() {
			console.log('here');
			throw other;
		}, just(123));

		return observe(function() {
			throw sentinel;
		}, s).catch(function(e) {
			expect(e).toBe(sentinel);
		});
	});

	it('should only recover first error if recovered stream also errors', function() {

		var s = error.recoverWith(function () {
			return error.throwError(sentinel);
		}, error.throwError(other));

		return observe(function() {
			throw new Error();
		}, s).catch(function(e) {
			expect(e).toBe(sentinel);
		});

	});
});
