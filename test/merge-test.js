require('buster').spec.expose();
var expect = require('buster').expect;

var merge = require('../lib/combinators/merge');
var delay = require('../lib/combinators/timed').delay;
var reduce = require('../lib/combinators/reduce').reduce;
var Stream = require('../lib/Stream');

describe('merge', function() {
	it('should include items from all inputs', function() {
		var a = [1,2,3];
		var b = [4,5,6];
		return reduce(function(result, x) {
			return result.concat(x);
		}, [], merge.merge(delay(0, Stream.from(a)), delay(0, Stream.from(b))))
			.then(function(result) {
				// Include all items
				expect(result.sort()).toEqual(a.concat(b).sort());

				// Relative order of items in each stream must be preserved
				expect(result.indexOf(1) < result.indexOf(2)).toBeTrue();
				expect(result.indexOf(2) < result.indexOf(3)).toBeTrue();
				expect(result.indexOf(4) < result.indexOf(5)).toBeTrue();
				expect(result.indexOf(5) < result.indexOf(6)).toBeTrue();
			});
	});
});

describe('mergeArray', function() {
	it('should include items from all inputs', function() {
		var a = [1,2,3];
		var b = [4,5,6];
		return reduce(function(result, x) {
			return result.concat(x);
		}, [], merge.mergeArray([delay(0, Stream.from(a)), delay(0, Stream.from(b))]))
			.then(function(result) {
				// Include all items
				expect(result.sort()).toEqual(a.concat(b).sort());

				// Relative order of items in each stream must be preserved
				expect(result.indexOf(1) < result.indexOf(2)).toBeTrue();
				expect(result.indexOf(2) < result.indexOf(3)).toBeTrue();
				expect(result.indexOf(4) < result.indexOf(5)).toBeTrue();
				expect(result.indexOf(5) < result.indexOf(6)).toBeTrue();
			});
	});
});

describe('mergeAll', function() {
	it('should include items from all inputs', function() {
		var a = [1,2,3];
		var b = [4,5,6];
		var streamsToMerge = Stream.from([delay(0, Stream.from(a)), delay(0, Stream.from(b))]);

		return reduce(function(result, x) {
			return result.concat(x);
		}, [], merge.mergeAll(streamsToMerge))
			.then(function(result) {
				// Include all items
				expect(result.sort()).toEqual(a.concat(b).sort());

				// Relative order of items in each stream must be preserved
				expect(result.indexOf(1) < result.indexOf(2)).toBeTrue();
				expect(result.indexOf(2) < result.indexOf(3)).toBeTrue();
				expect(result.indexOf(4) < result.indexOf(5)).toBeTrue();
				expect(result.indexOf(5) < result.indexOf(6)).toBeTrue();
			});
	});
});
