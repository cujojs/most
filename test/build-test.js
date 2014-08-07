require('buster').spec.expose();
var expect = require('buster').expect;

var build = require('../lib/combinators/build');
var step = require('../lib/step');
var Yield = step.Yield;
var End = step.End;

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

describe('build', function() {

	beforeAll(function() {
		// This is for Node 0.11.13's Promise, which is astonishingly slow.
		// You really should use when.js's es6-shim
//		this.timeout = 5000;
	});

	describe('unfold', function() {
		it('should call unfold with seed', function() {
			return build.unfold(function(x) {
				return new Yield(0, x, x);
			}, sentinel).observe(function(x) {
				expect(x).toBe(sentinel);
				return new End(0);
			});
		});

		it('should unfold until end', function() {
			var count = 0;
			var expected = 3;

			return build.unfold(function(x) {
				return new Yield(0, x, x - 1);
			}, expected).observe(function(x) {
				if(x === 0) {
					return new End(0);
				}
				count++;
			}).then(function() {
				expect(count).toBe(expected);
			});
		});

		it('should reject on error', function() {
			var spy = this.spy();
			return build.unfold(function() {
				throw sentinel;
			}, other).observe(spy).catch(function(e) {
				expect(spy).not.toHaveBeenCalled();
				expect(e).toBe(sentinel);
			});
		});

	});

	describe('iterate', function() {

		it('should call iterator with seed', function() {
			return build.iterate(function(x) {
				return x;
			}, sentinel).observe(function(x) {
				expect(x).toBe(sentinel);
				return new End();
			});
		});

		it('should iterate until end', function() {
			var count = 0;
			var expected = 3;

			return build.iterate(function(x) {
				return x - 1;
			}, expected).observe(function(x) {
				if(x === 0) {
					return new End(0);
				}
				count++;
			}).then(function() {
				expect(count).toBe(expected);
			});
		});

		it('should reject on error', function() {
			var spy = this.spy();
			return build.iterate(function() {
				throw sentinel;
			}, other).observe(spy).catch(function(e) {
				expect(spy).not.toHaveBeenCalled();
				expect(e).toBe(sentinel);
			});
		});
	});

	describe('repeat', function() {
		it('should repeat value', function() {
			return build.repeat(sentinel)
				.take(10)
				.observe(function(x) {
					expect(x).toBe(sentinel);
				});
		});
	});

});
