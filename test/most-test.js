require('buster').spec.expose();
var expect = require('buster').expect;

var most = require('../most');
var sentinel = { value: 'sentinel' };

describe('chain', function() {
	it('should be an alias for flatMap', function() {
		expect(typeof most.chain).toBe('function');
		expect(most.chain).toBe(most.flatMap);
		expect(most.Stream.prototype.chain).toBe(most.Stream.prototype.flatMap);
	});
});

describe('forEach', function() {
	it('should be an alias for observe', function() {
		expect(typeof most.forEach).toBe('function');
		expect(most.forEach).toBe(most.observe);
		expect(most.Stream.prototype.forEach).toBe(most.Stream.prototype.observe);
	});
});

describe('takeUntil', function() {
	it('should be an alias for until', function() {
		expect(typeof most.takeUntil).toBe('function');
		expect(most.takeUntil).toBe(most.until);
		expect(most.Stream.prototype.takeUntil).toBe(most.Stream.prototype.until);
	});
});

describe('skipUntil', function() {
	it('should be an alias for since', function() {
		expect(typeof most.skipUntil).toBe('function');
		expect(most.skipUntil).toBe(most.since);
		expect(most.Stream.prototype.skipUntil).toBe(most.Stream.prototype.since);
	});
});

describe('distinct', function() {
	it('should be an alias for skipRepeats', function() {
		expect(typeof most.distinct).toBe('function');
		expect(most.distinct).toBe(most.skipRepeats);
		expect(most.Stream.prototype.distinct).toBe(most.Stream.prototype.skipRepeats);
	});
});

describe('distinctBy', function() {
	it('should be an alias for skipRepeatsWith', function() {
		expect(typeof most.distinctBy).toBe('function');
		expect(most.distinctBy).toBe(most.skipRepeatsWith);
		expect(most.Stream.prototype.distinctBy).toBe(most.Stream.prototype.skipRepeatsWith);
	});
});