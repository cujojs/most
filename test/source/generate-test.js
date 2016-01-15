require('buster').spec.expose();
var expect = require('buster').expect;

var generate = require('../../lib/source/generate').generate;
var reduce = require('../../lib/combinator/accumulate').reduce;
var iterable = require('../../lib/iterable');
var ArrayIterable = require('../helper/ArrayIterable');
var delayPromise = require('../helper/delayPromise');

function makeAsyncIterator(ms, n) {
	var a = new Array(n);
	for(var i=0; i<n; ++i) {
		a[i] = delayPromise(ms, i);
	}

	return iterable.getIterator(new ArrayIterable(a));
}

describe('generate', function() {
	it('should contain iterable items', function() {
		return reduce(function(a, x) {
			a.push(x);
			return a;
		}, [], generate(makeAsyncIterator, 10, 5)).then(function(a) {
			expect(a).toEqual([0,1,2,3,4]);
		});
	});

});
