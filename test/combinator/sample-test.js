require('buster').spec.expose();
var expect = require('buster').expect;

var sample = require('../../lib/combinator/sample');
var sampleWith = require('../../lib/combinator/sample').sampleWith;
var periodic = require('../../lib/source/periodic').periodic;
var take = require('../../lib/combinator/slice').take;
var map = require('../../lib/combinator/transform').map;
var scan = require('../../lib/combinator/accumulate').scan;
var reduce = require('../../lib/combinator/accumulate').reduce;
var observe = require('../../lib/combinator/observe').observe;
var core = require('../../lib/source/core');

var empty = core.empty;
var streamOf = core.of;

var sentinel = { value: 'sentinel' };

function inc(x) {
	return x+1;
}

function append(a, x) {
	return a.concat([x]);
}

describe('sample', function() {
	it('should be empty if sampler is empty', function() {
		var spy = this.spy();
		var s = sample.sample(spy, empty(), streamOf(sentinel), streamOf(123));

		var observer = this.spy();
		return observe(observer, s)
			.then(function() {
				expect(spy).not.toHaveBeenCalled();
				expect(observer).not.toHaveBeenCalled();
			});
	});

	it('should sample latest value', function() {
		var s1 = scan(inc, 0, periodic(20));
		var s2 = scan(inc, 0, periodic(10));

		var s = sample.sample(Array, periodic(10), s1, s2);

		return reduce(append, [], take(5, s))
			.then(function(a) {
				expect(a).toEqual([
					[1, 1],
					[1, 2],
					[2, 3],
					[2, 4],
					[3, 5]
				]);
			});
	});

	it('should repeat last value after source ends', function() {
		var s = sample.sample(Array, periodic(1), streamOf(sentinel), streamOf(123));

		return observe(function(x) {
			expect(x).toEqual([sentinel, 123]);
		}, take(3, s));
	});
});

describe('sampleWith', function() {
	it('should be empty if sampler is empty', function() {
		var s = sample.sampleWith(empty(), streamOf(sentinel));

		return reduce(function (x) {
			return x+1;
		}, 0, s)
			.then(function(x) {
				expect(x).toBe(0);
			});
	});

	it('should sample latest value', function() {
		var i = 0;
		var s = sampleWith(take(4, periodic(20)), map(function() {
			return i++;
		}, periodic(11)));

		return reduce(append, [], s)
			.then(function(a) {
				expect(a).toEqual([0, 1, 3, 5]);
			});
	});

	it('should sample latest value', function() {
		var i = 0;
		var s = sampleWith(take(8, periodic(10)), map(function() {
			return i++;
		}, periodic(18)));

		return reduce(append, [], s)
			.then(function(a) {
				expect(a).toEqual([0, 0, 1, 1, 2, 2, 3, 3]);
			});
	});

	it('should repeat last value after source ends', function() {
		var s = sample.sampleWith(take(3, periodic(1)), streamOf(sentinel));

		return reduce(append, [], s)
			.then(function(a) {
				expect(a).toEqual([sentinel, sentinel, sentinel]);
			});
	});
});
