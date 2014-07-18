require('buster').spec.expose();
var expect = require('buster').expect;

var findIndex = require('../../lib/binarySearch').findIndex;

function compare(a, b) {
	return a - b;
}

describe('binarySearch', function() {

	describe('findIndex', function() {
		describe('when item is present', function() {
			it('should return its index', function() {
				var array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
				array.forEach(function(x, i, array) {
					expect(findIndex(compare, x, array)).toBe(i);
				});
			});
		});

		describe('when item is not present', function() {
			it('should return the index where the item should be inserted', function() {
				var array = [2, 4, 6, 8];
				expect(findIndex(compare, 1, array)).toBe(0);
				expect(findIndex(compare, 3, array)).toBe(1);
				expect(findIndex(compare, 5, array)).toBe(2);
				expect(findIndex(compare, 7, array)).toBe(3);
				expect(findIndex(compare, 9, array)).toBe(4);
			});
		});
	});

});