require('buster').spec.expose();
var expect = require('buster').expect;

var most = require('../most');
var sentinel = { value: 'sentinel' };

describe('cycle', function() {

	it('should keep repeating', function() {
		return most.from([1, 2, 3]).cycle()
			.take(9)
			.reduce(function(result, x) {
				return result.concat(x);
			}, []).then(function(result) {
				expect(result).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3]);
			});
	});

	it('should end on error', function() {
		return most.from([1, 2, 3]).cycle()
			.observe(function() { throw sentinel; }).catch(function(e) {
				expect(e).toBe(sentinel);
			});
	});
});

describe('cons', function() {
	it('should return a stream containing item as head', function() {
		return most.from([1,2,3])
			.startWith(sentinel)
			.head()
			.then(function(x) {
				expect(x).toBe(sentinel);
			});
	});

	it('when empty, should return a stream containing item as head', function() {
		return most.empty()
			.startWith(sentinel)
			.head()
			.then(function(x) {
				expect(x).toBe(sentinel);
			});
	});
});

describe('startWith', function() {
	it('should be an alias for cons', function() {
		expect(most.startWith).toBe(most.cons);
		expect(most.Stream.prototype.startWith).toBe(most.Stream.prototype.cons);
	});
});

describe('chain', function() {
	it('should be an alias for flatMap', function() {
		expect(most.chain).toBe(most.flatMap);
		expect(most.Stream.prototype.chain).toBe(most.Stream.prototype.flatMap);
	});
});

describe('forEach', function() {
	it('should be an alias for observe', function() {
		expect(most.forEach).toBe(most.observe);
		expect(most.forEachUntil).toBe(most.observeUntil);
		expect(most.Stream.prototype.forEach).toBe(most.Stream.prototype.observe);
		expect(most.Stream.prototype.forEachUntil).toBe(most.Stream.prototype.observeUntil);
	});
});
