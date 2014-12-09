require('buster').spec.expose();
var expect = require('buster').expect;

var build = require('../lib/combinator/build');
var take = require('../lib/combinator/slice').take;
var observe = require('../lib/combinator/observe').observe;
//var step = require('../lib/step');
//var Yield = step.Yield;
//var End = step.End;

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

describe('build', function() {

	describe('unfold', function() {
		it('should call unfold with seed', function() {
			var s = take(1, build.unfold(function (x) {
				return { value: x, state: x };
			}, sentinel));

			return observe(function(x) {
				expect(x).toBe(sentinel);
			}, s);
		});

		it('should unfold until end', function() {
			var count = 0;
			var expected = 3;

			var s = take(expected, build.unfold(function (x) {
				return { value: x, state: x+1 };
			}, 0));

			return observe(function(x) {
				expect(x).toBe(count);
				count++;
			}, s).then(function() {
				expect(count).toBe(expected);
			});
		});

		it('should reject on error', function() {
			var spy = this.spy();
			var s = build.unfold(function () {
				throw sentinel;
			}, other);

			return observe(spy, s).catch(function(e) {
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
				expect(spy).toHaveBeenCalledOnceWith(other);
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
