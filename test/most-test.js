require('buster').spec.expose();
var expect = require('buster').expect;

var most = require('../most');
var sentinel = { value: 'sentinel' };

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
