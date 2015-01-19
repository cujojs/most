require('buster').spec.expose();
var expect = require('buster').expect;

var sampleWith = require('../../lib/combinator/sampleWith').sampleWith;
var periodic = require('../../lib/source/periodic').periodic;
var take = require('../../lib/combinator/slice').take;
var map = require('../../lib/combinator/transform').map;
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
	return a.concat(x);
}

describe('sampleWith', function() {
	it('should be empty if sampler is empty', function() {
		var s = sampleWith(empty(), streamOf(sentinel));

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
		var s = sampleWith(take(3, periodic(1)), streamOf(sentinel));

		return reduce(append, [], s)
			.then(function(a) {
				expect(a).toEqual([sentinel, sentinel, sentinel]);
			});
	});
});
