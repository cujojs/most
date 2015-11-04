require('buster').spec.expose();
var expect = require('buster').expect;

var Stream = require('../lib/Stream');
var accumulate = require('../lib/combinator/accumulate');
var throwError = require('../lib/combinator/errors').throwError;
var observe = require('../lib/combinator/observe').observe;
var drain = require('../lib/combinator/observe').drain;
var fromArray = require('../lib/source/fromArray').fromArray;
var create = require('../lib/source/create').create;
var core = require('../lib/source/core');

var scan = accumulate.scan;
var reduce = accumulate.reduce;

var empty = core.empty;
var streamOf = core.of;

var FakeDisposeSource = require('./helper/FakeDisposeSource');

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

describe('scan', function() {
	it('should yield combined values', function() {
		var i = 0;
		var items = 'abcd';

		var stream = scan(function (s, x) {
			return s + x;
		}, items[0], fromArray(items.slice(1)));

		return observe(function(s) {
			++i;
			expect(s).toEqual(items.slice(0, i));
		}, stream);
	});

	it('should preserve end value', function() {
		var expectedEndValue = {};
		var stream = create(function(add, end) {
			add(1);
			add(2);
			end(expectedEndValue);
		});

		var s = scan(function(a, x) {
			expect(x).not.toBe(expectedEndValue);
			return x;
		}, 0, stream);

		return drain(s).then(function(endValue) {
			expect(endValue).toBe(expectedEndValue);
		});
	});

	it('should dispose', function() {
		var dispose = this.spy();

		var stream = new Stream(new FakeDisposeSource(dispose, streamOf(sentinel).source));
		var s = scan(function(z, x) { return x; }, 0, stream);

		return drain(s).then(function() {
			expect(dispose).toHaveBeenCalledOnce();
		});
	});
});

describe('reduce', function() {

	describe('when stream is empty', function() {

		it('should reduce to initial', function() {
			return reduce(function() {
				throw new Error();
			}, sentinel, empty())
				.then(function(result) {
					expect(result).toBe(sentinel);
				});
		});

	});

	describe('when stream errors', function() {

		it('should reject', function() {
			return reduce(function(x) {
				return x;
			}, other, throwError(sentinel))
				.catch(function(e) {
					expect(e).toBe(sentinel);
				});
		});

	});

	it('should reduce values', function() {
		return reduce(function(s, x) {
			return s+x;
		}, 'a', fromArray(['b', 'c', 'd']))
			.then(function(result) {
				expect(result).toBe('abcd');
			});
	});

});
