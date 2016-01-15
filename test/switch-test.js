require('buster').spec.expose();
var expect = require('buster').expect;

var switchLatest = require('../lib/combinator/switch').switch;
var reduce = require('../lib/combinator/accumulate').reduce;
var observe = require('../lib/combinator/observe').observe;
var take = require('../lib/combinator/slice').take;
var transform = require('../lib/combinator/transform');
var periodic = require('../lib/source/periodic').periodic;
var fromArray = require('../lib/source/fromArray').fromArray;
var core = require('../lib/source/core');
var Stream = require('../lib/Stream');

var constant = transform.constant;
var map = transform.map;

function sequenceEqual(array, stream) {
	return reduce(function(a, x) {
		return a.concat(x);
	}, [], stream)
		.then(function(a) {
			expect(a).toEqual(array);
		});
}

describe('switch', function() {
	describe('when input is empty', function() {
		it('should return empty', function() {
			var spy = this.spy();
			return observe(spy, switchLatest(core.empty()))
				.then(function() {
					expect(spy).not.toHaveBeenCalled();
				});
		});
	});

	describe('when input contains a single stream', function() {
		it('should return an equivalent stream', function() {
			var expected = [1, 2, 3];
			var s = core.of(fromArray(expected));

			return sequenceEqual(expected, switchLatest(s));
		});
	});

	describe('when input contains many streams', function() {
		describe('and all items are instantaneous', function() {
			it('should be equivalent to the last inner stream', function() {
				var expected = [1, 2, 3];
				var s = fromArray([
					fromArray([4, 5, 6]),
					fromArray(expected)
				]);

				return sequenceEqual(expected, switchLatest(s));
			});
		});

		it('should switch when new stream arrives', function() {
			var i = 0;
			var s = map(function() {
				return constant(++i, periodic(10));
			}, periodic(25));

			return sequenceEqual([1,1,1,2,2,2,3,3,3,4], take(10, switchLatest(s)));
		});
	});
});
