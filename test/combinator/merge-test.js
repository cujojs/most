require('buster').spec.expose();
var expect = require('buster').expect;

var merge = require('../../lib/combinator/merge');
var delay = require('../../lib/combinator/delay').delay;
var reduce = require('../../lib/combinator/accumulate').reduce;
var fromArray = require('../../lib/source/fromArray').fromArray;
var streamOf = require('../../lib/source/core').of;

var te = require('../helper/testEnv');

describe('merge', function() {
	it('should include items from all inputs', function() {
		return testMerge(merge.merge);
	});

	it('should be associative', function() {
		var s1 = streamOf(1);
		var s2 = streamOf(2);
		var s3 = streamOf(3);

		var p1 = toArray(merge.merge(merge.merge(s1, s2), s3));
		var p2 = toArray(merge.merge(s1, merge.merge(s2, s3)));

		return Promise.all([p1,p2]).then(function(a) {
			var p1 = a[0].sort();
			var p2 = a[1].sort();

			expect(p1).toEqual(p2);
		});
	});
});

describe('mergeArray', function() {
	it('should include items from all inputs', function() {
		return testMerge(function(s1, s2) {
			return merge.mergeArray([s1, s2]);
		});
	});
});

function testMerge(merge) {
	var a = [1, 2, 3];
	var b = [4, 5, 6];
	var sa = fromArray(a);
	var sb = fromArray(b);

	var s = merge(delay(2, sa), delay(1, sb));
    return te.collectEvents(s, te.ticks(2))
		.then(function (events) {
			var result = events.map(function(event) {
				return event.value;
			});
			// Include all items
			expect(result.slice().sort()).toEqual(a.concat(b).sort());

			// Relative order of items in each stream must be preserved
			expect(result.indexOf(1) < result.indexOf(2)).toBeTrue();
			expect(result.indexOf(2) < result.indexOf(3)).toBeTrue();

			expect(result.indexOf(4) < result.indexOf(5)).toBeTrue();
			expect(result.indexOf(5) < result.indexOf(6)).toBeTrue();
		});
}

function toArray(s) {
	return reduce(function(result, x) {
		return result.concat(x);
	}, [], s);
}
