require('buster').spec.expose();
var expect = require('buster').expect;

var most = require('../most');

describe('just', function() {
	it('should be an alias for of', function() {
		expect(typeof most.just).toBe('function');
		expect(most.just).toBe(most.of);
	});
});

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

describe('flatMapEnd', function() {
	it('should be an alias for continueWith', function() {
		expect(typeof most.flatMapEnd).toBe('function');
		expect(most.flatMapEnd).toBe(most.continueWith);
		expect(most.Stream.prototype.flatMapEnd).toBe(most.Stream.prototype.continueWith);
	});

	describe('flatMapError', function() {
		it('should be an alias for recoverWith', function () {
			expect(typeof most.flatMapError).toBe('function');
			expect(most.flatMapError).toBe(most.recoverWith);
			expect(most.Stream.prototype.flatMapError).toBe(most.Stream.prototype.recoverWith);
		});
	});
});

describe('multicast', function() {
	it('should be a function', function() {
		expect(typeof most.multicast).toBe('function');
		expect(typeof most.Stream.prototype.multicast).toBe('function');
	});
});
