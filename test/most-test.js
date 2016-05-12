require('buster').spec.expose();
var assert = require('buster').referee.assert;

var most = require('../most');
var symbolObservable = require('symbol-observable');

describe('just', function() {
	it('should be an alias for of', function() {
		assert.isFunction(most.just);
		assert.same(most.just, most.of);
	});
});

describe('chain', function() {
	it('should be an alias for flatMap', function() {
		assert.isFunction(most.chain);
		assert.same(most.chain, most.flatMap);
		assert.same(most.Stream.prototype.chain, most.Stream.prototype.flatMap);
	});
});

describe('forEach', function() {
	it('should be an alias for observe', function() {
		assert.isFunction(most.forEach);
		assert.same(most.forEach, most.observe);
		assert.same(most.Stream.prototype.forEach, most.Stream.prototype.observe);
	});
});

describe('takeUntil', function() {
	it('should be an alias for until', function() {
		assert.isFunction(most.takeUntil);
		assert.same(most.takeUntil, most.until);
		assert.same(most.Stream.prototype.takeUntil, most.Stream.prototype.until);
	});
});

describe('skipUntil', function() {
	it('should be an alias for since', function() {
		assert.isFunction(most.skipUntil);
		assert.same(most.skipUntil, most.since);
		assert.same(most.Stream.prototype.skipUntil, most.Stream.prototype.since);
	});
});

describe('flatMapEnd', function() {
	it('should be an alias for continueWith', function() {
		assert.isFunction(most.flatMapEnd);
		assert.same(most.flatMapEnd, most.continueWith);
		assert.same(most.Stream.prototype.flatMapEnd, most.Stream.prototype.continueWith);
	});

	describe('flatMapError', function() {
		it('should be an alias for recoverWith', function () {
			assert.isFunction(most.flatMapError);
			assert.same(most.flatMapError, most.recoverWith);
			assert.same(most.Stream.prototype.flatMapError, most.Stream.prototype.recoverWith);
		});
	});
});

describe('multicast', function() {
	it('should be a function', function() {
		assert.isFunction(most.multicast);
		assert.isFunction(most.Stream.prototype.multicast);
	});
});

describe('ES7 Observable API interop', function() {
	it('should exist', function() {
		assert.isFunction(most.Stream.prototype.subscribe);
		assert.isFunction(most.Stream.prototype[symbolObservable]);
	});
});
