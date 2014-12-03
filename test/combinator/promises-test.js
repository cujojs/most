require('buster').spec.expose();
var expect = require('buster').expect;

var promises = require('../../lib/combinator/promises');
var delay = require('../../lib/combinator/delay').delay;
var observe = require('../../lib/combinator/observe').observe;
var reduce = require('../../lib/combinator/accumulate').reduce;
var streamOf = require('../../lib/source/core').of;
var fromArray = require('../../lib/source/fromArray').fromArray;
var Promise = require('../../lib/Promise');

var sentinel = { value: 'sentinel' };


describe('await', function() {

	it('should await promises', function() {
		var s = promises.await(streamOf(Promise.resolve(sentinel)));

		return observe(function(x) {
			expect(x).toBe(sentinel);
		}, s);
	});

	it('should preserve event order', function() {
		var slow = new Promise(function(resolve) {
			setTimeout(resolve, 10, 1);
		});
		var fast = Promise.resolve(sentinel);

		// delayed promise followed by already fulfilled promise
		var s = promises.await(fromArray([slow, fast]));

		return reduce(function (a, x) {
			return a.concat(x);
		}, [], s).then(function (a) {
			expect(a).toEqual([1, sentinel]);
		});
	});

});

describe('fromPromise', function() {

	it('should contain only promise\'s fulfillment value', function() {
		return observe(function(x) {
			expect(x).toBe(sentinel);
		}, promises.fromPromise(Promise.resolve(sentinel)));
	});

});