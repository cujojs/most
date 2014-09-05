require('buster').spec.expose();
var expect = require('buster').expect;

var build = require('../lib/combinators/build');
var take = require('../lib/combinators/filter').take;
var observe = require('../lib/combinators/observe').observe;
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
			return build.unfold(function(step) {
				return step;
			}, new Yield(0, sentinel, new End())).observe(function(x) {
				expect(x).toBe(sentinel);
			});
		});

		it('should unfold until end', function() {
			var count = 0;
			var expected = 3;

			return build.unfold(function(x) {
				return x === 0 ? new End() : new Yield(0, x, x - 1);
			}, expected).observe(function() {
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
			var s = take(1, build.iterate(function (x) {
				return x;
			}, sentinel));

			return observe(function(x) {
				expect(x).toBe(sentinel);
			}, s);
		});

		it('should reject on error', function() {
			var spy = this.spy();
			var s = build.iterate(function () {
				throw sentinel;
			}, other);

			return observe(spy, s).catch(function(e) {
				expect(spy).not.toHaveBeenCalled();
				expect(e).toBe(sentinel);
			});
		});
	});

	describe('repeat', function() {
		it('should repeat value', function() {
			var s = take(10, build.repeat(sentinel));
			return observe(function(x) {
				expect(x).toBe(sentinel);
			}, s);
		});
	});

});
