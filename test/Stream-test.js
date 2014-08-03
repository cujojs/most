require('buster').spec.expose();
var expect = require('buster').expect;

var Stream = require('../lib/Stream');
var iterate = require('../lib/combinators/build').iterate;
var Promise = require('../lib/promises').Promise;

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

function empty() {
	return new Stream(function() {
		return new Stream.End();
	});
}

describe('Stream', function() {

	beforeAll(function() {
		// This is for Node 0.11.13's Promise, which is astonishingly slow.
		// You really should use when.js's es6-shim
//		this.timeout = 5000;
	});

	describe('head', function() {
		it('should return a promise for first item', function() {
			return Stream.from([sentinel, other])
				.head()
				.then(function(x) {
					expect(x).toBe(sentinel);
				});
		});

		it('should fail when empty', function() {
			return empty().head().then(function(x) {
				throw new Error('should not have returned ' + x);
			}).catch(function(e) {
				expect(e).toBeDefined();
			});
		});
	});

	describe('forEach', function() {
		it('should be an alias for observe', function() {
			expect(Stream.prototype.forEach).toBe(Stream.prototype.observe);
		});
	});

	describe('observe', function() {

		it('should call callback and return a promise', function() {
			var spy = this.spy();

			return Stream.of(sentinel)
				.observe(spy)
				.then(function() {
					expect(spy).toHaveBeenCalledWith(sentinel);
				});
		});

		it('should end if consumer returns End', function() {
			var spy = this.spy(function() {
				return new Stream.End();
			});

			return Stream.from([sentinel, other])
				.observe(spy)
				.then(function() {
					expect(spy).toHaveBeenCalledOnceWith(sentinel);
					expect(spy).not.toHaveBeenCalledWith(other);
				});
		});

	});

	describe('of', function() {

		it('should contain one item', function() {
			return Stream.of(sentinel).observe(function(x) {
				expect(x).toBe(sentinel);
			});
		});

	});

	describe('from', function() {

		it('should contain array items', function() {
			var input = [1,2,3];
			var result = [];
			return Stream.from([1,2,3]).observe(function(x) {
				result.push(x);
			}).then(function() {
				expect(result).toEqual(input);
			});
		});

	});

	describe('fromPromise', function() {
		it('should contain only promise\'s fulfillment value', function() {
			return Stream.fromPromise(Promise.resolve(sentinel))
				.observe(function(x) {
					expect(x).toBe(sentinel);
				});
		});
	});

	describe('tail', function() {
		it('should contain all items except the first', function() {
			var count = 0;
			var items = [other, sentinel, sentinel];
			return Stream.from(items)
				.tail()
				.observe(function(x) {
					count++;
					expect(x).toBe(sentinel);
				}).then(function() {
					expect(count).toBe(items.length-1);
				});
		});

		it('should be empty when original contains only one item', function() {
			var spy = this.spy();
			return Stream.of(sentinel)
				.tail()
				.observe(spy)
				.then(function() {
					expect(spy).not.toHaveBeenCalled();
				});
		});

		it('should be empty when original is empty', function() {
			var spy = this.spy();
			return empty()
				.tail()
				.observe(spy)
				.then(function() {
					expect(spy).not.toHaveBeenCalled();
				});
		});
	});

//	describe('drop', function() {
//
//		it('should take only the last two elements', function(done) {
//			var values = [1, 2, 3];
//			var s1 = new Stream(function(next, end) {
//				values.observe(next);
//				end();
//			});
//
//			var s2 = s1.drop(1);
//			expect(s1).not.toBe(s2);
//			expect(s2 instanceof s1.constructor).toBeTrue();
//
//			var result = [];
//			s2.observe(function(x) {
//				result.push(x);
//			}, function() {
//				expect(result).toEqual([2, 3]);
//				done();
//			});
//
//		});
//
//		it('should take only the last two elements with condition', function(done) {
//			var values = [1, 2, 3];
//			var s1 = new Stream(function(next, end) {
//				values.observe(next);
//				end();
//			});
//
//			var s2 = s1.dropWhile(function(x) {
//				return x < 2;
//			});
//
//			expect(s1).not.toBe(s2);
//			expect(s2 instanceof s1.constructor).toBeTrue();
//
//			var result = [];
//			s2.observe(function(x) {
//				result.push(x);
//			}, function() {
//				expect(result).toEqual([2, 3]);
//				done();
//			});
//
//		});
//
//		it('should call end on error', function(done) {
//			Stream.of(1).dropWhile(function() {
//				throw sentinel;
//			}).observe(function() {
//					throw sentinel;
//				}, function(e) {
//					expect(e).toBe(sentinel);
//					done();
//				});
//		});
//
//		it('should not call end when no error', function(done) {
//			var nextSpy = this.spy();
//
//			fromArray([1, 2]).drop(1).observe(nextSpy, function(e) {
//				expect(e).not.toBeDefined();
//				expect(nextSpy).toHaveBeenCalledOnce();
//				done();
//			});
//		});
//
//	});
//
//	describe('bufferCount', function() {
//
//		it('should should buffer N items', function(done) {
//			var spy = this.spy();
//
//			new Stream(function(next, end) {
//				next(1);
//				next(2);
//				expect(spy).not.toHaveBeenCalled();
//				next(3);
//				expect(spy).toHaveBeenCalledWith([1,2,3]);
//				next(4);
//				expect(spy).not.toHaveBeenCalledTwice();
//				end();
//			}).bufferCount(3).observe(spy, done);
//		});
//
//		it('should buffer N items even with infinite stream', function(done) {
//			var s  = Stream.iterate(function(x) {return x+1;}, 1).bufferCount(3);
//			var i = 0, result = [];
//			var unsubscribe = s.observe(function(x) {
//				result.push(x);
//				i++;
//				(i >= 6) && unsubscribe();
//			}, function() {
//				expect(i).toEqual(6);
//				done();
//			});
//		});
//
//	});
//
//	describe('bufferTime', function() {
//
//		it('should should buffer items in time window', function(done) {
//			var spy = this.spy();
//
//			new Stream(function(next, end) {
//				next(1);
//				setTimeout(function() {
//					next(2);
//				}, 50);
//
//				setTimeout(function() {
//					next(3);
//				}, 150);
//
//				setTimeout(function() {
//					expect(spy).not.toHaveBeenCalled();
//				}, 55);
//
//				setTimeout(function() {
//					expect(spy).toHaveBeenCalledWith([1,2]);
//					end();
//				}, 155);
//
//			}).bufferTime(100).observe(spy, done);
//		});
//
//	});


});
