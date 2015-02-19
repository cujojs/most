require('buster').spec.expose();
var expect = require('buster').expect;

var combine = require('../lib/combinator/combine').combine;
var map = require('../lib/combinator/transform').map;
var take = require('../lib/combinator/slice').take;
var delay = require('../lib/combinator/delay').delay;
var observe = require('../lib/combinator/observe').observe;
var reduce = require('../lib/combinator/accumulate').reduce;
var periodic = require('../lib/source/periodic').periodic;
var streamOf = require('../lib/source/core').of;
var Stream = require('../lib/Stream');

var sentinel = { value: 'sentinel' };

describe('combine', function() {
	it('should yield initial only after all inputs yield', function() {
		var s1 = streamOf(1);
		var s2 = streamOf(sentinel);

		var sc = combine(Array, s1, delay(2, s2));

		return observe(function(x) {
			expect(x[1]).toBe(sentinel);
		}, sc);
	});

	it('should yield when any input stream yields', function() {

		var a1 = [0,2,4,6];
		var s1 = map(function() {
			return a1.shift();
		}, periodic(10));

		var a2 = [1,3,5];
		var s2 = map(function() {
			return a2.shift();
		}, periodic(12));

		var sc = combine(Array, take(a1.length, s1), take(a2.length, s2));

		return reduce(function(array, x) {
			array.push(x);
			return array;
		}, [], sc)
			.then(function(result) {
				expect(result).toEqual([
					[0,1],
					[2,1],
					[2,3],
					[4,3],
					[4,5],
					[6,5]
				]);
			});
	});
});