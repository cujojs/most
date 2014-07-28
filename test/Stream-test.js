require('buster').spec.expose();
var expect = require('buster').expect;

var Stream = require('../lib/Stream');
var build = require('../lib/combinators/build');
var iterate = build.iterate;
var repeat = build.repeat;
var Promise = require('../lib/promises').Promise;

var createTestScheduler = require('./createTestScheduler');

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

function assertSame(p1, p2) {
	return p1.observe(function(x) {
		return p2.observe(function(y) {
			expect(x).toBe(y);
		});
	});
}

describe('Stream', function() {

	beforeAll(function() {
		// This is for Node 0.11.13's Promise, which is astonishingly slow.
		// You really should use when.js's es6-shim
//		this.timeout = 5000;
	});

	describe('empty', function() {
		it('should yield no items before end', function() {
			return Stream.empty().observe(function(x) {
				throw new Error('not empty ' + x);
			}).then(function() {
				expect(true).toBeTrue();
			});
		});
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
			return Stream.empty().head().then(function(x) {
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
			return Stream.empty()
				.tail()
				.observe(spy)
				.then(function() {
					expect(spy).not.toHaveBeenCalled();
				});
		});
	});

	describe('map', function() {

		it('should satisfy identity', function() {
			// u.map(function(a) { return a; })) ~= u
			var u = Stream.of(sentinel);
			return assertSame(u.map(function(x) { return x; }), u);
		});

		it('should satisfy composition', function() {
			//u.map(function(x) { return f(g(x)); }) ~= u.map(g).map(f)
			function f(x) { return x + 'f'; }
			function g(x) { return x + 'g'; }

			var u = Stream.of('e');

			return assertSame(
				u.map(function(x) { return f(g(x)); }),
				u.map(g).map(f)
			);
		});

	});

	describe('tap', function() {

		it('should not transform stream items', function() {
			return Stream.of(sentinel).tap(function() {
				return other;
			}).observe(function(x) {
				expect(x).toBe(sentinel);
			});
		});

	});

	describe('flatMap', function() {
		it('should be an alias for chain', function() {
			expect(Stream.prototype.flatMap).toBe(Stream.prototype.chain);
		});
	});

	describe('chain', function() {

		it('should satisfy associativity', function() {
			// m.flatMap(f).flatMap(g) ~= m.flatMap(function(x) { return f(x).flatMap(g); })
			function f(x) { return Stream.of(x + 'f'); }
			function g(x) { return Stream.of(x + 'g'); }

			var m = Stream.of('m');

			return assertSame(
				m.chain(function(x) { return f(x).chain(g); }),
				m.chain(f).chain(g)
			);
		});

	});

	describe('ap', function() {

		it('should satisfy identity', function() {
			// P.of(function(a) { return a; }).ap(v) ~= v
			var v = Stream.of(sentinel);
			return assertSame(Stream.of(function(x) { return x; }).ap(v), v);
		});

		it('should satisfy composition', function() {
			//P.of(function(f) { return function(g) { return function(x) { return f(g(x))}; }; }).ap(u).ap(v
			var u = Stream.of(function(x) { return 'u' + x; });
			var v = Stream.of(function(x) { return 'v' + x; });
			var w = Stream.of('w');

			return assertSame(
				Stream.of(function(f) {
					return function(g) {
						return function(x) {
							return f(g(x));
						};
					};
				}).ap(u).ap(v).ap(w),
				u.ap(v.ap(w))
			);
		});

		it('should satisfy homomorphism', function() {
			//P.of(f).ap(P.of(x)) ~= P.of(f(x)) (homomorphism)
			function f(x) { return x + 'f'; }
			var x = 'x';
			return assertSame(Stream.of(f).ap(Stream.of(x)), Stream.of(f(x)));
		});

		it('should satisfy interchange', function() {
			// u.ap(a.of(y)) ~= a.of(function(f) { return f(y); }).ap(u)
			function f(x) { return x + 'f'; }

			var u = Stream.of(f);
			var y = 'y';

			return assertSame(
				u.ap(Stream.of(y)),
				Stream.of(function(f) { return f(y); }).ap(u)
			);
		});

	});

	describe('filter', function() {

		it('should return a stream containing only allowed items', function() {
			return Stream.from([sentinel, other]).filter(function(x) {
				return x === sentinel;
			}).observe(function(x) {
				expect(x).toBe(sentinel);
			});
		});

		it('should filter an infinite stream', function() {
			return iterate(function(x) {return x+1;}, 0)
				.filter(function(x) {
					return x % 2 === 0;
				})
				.observe(function(x) {
					expect(x % 2 === 0).toBeTrue();
					if(x > 10) {
						return new Stream.End();
					}
				});
		});

	});

	describe('distinct', function() {

		it('should return a stream with adjacent duplicates removed', function() {
			return Stream.from([1, 2, 2, 3, 4, 4])
				.distinct()
				.reduce(function(a, x) {
					a.push(x);
					return a;
				}, []).then(function(a) {
					expect(a).toEqual([1,2,3,4]);
				});
		});

	});

	describe('startWith', function() {
		it('should return a stream containing item as head', function() {
			return Stream.from([1,2,3])
				.startWith(sentinel)
				.head()
				.then(function(x) {
					expect(x).toBe(sentinel);
				});
		});

		it('when empty, should return a stream containing item as head', function() {
			return Stream.empty()
				.startWith(sentinel)
				.head()
				.then(function(x) {
					expect(x).toBe(sentinel);
				});
		});
	});

	describe('concat', function() {

		it('should return a stream containing items from both streams in correct order', function() {
			var a1 = [1,2,3];
			var a2 = [4,5,6];
			var s1 = Stream.from(a1);
			var s2 = Stream.from(a2);

			return s1.concat(s2)
				.reduce(function(a, x) {
					a.push(x);
					return a;
				}, []).then(function(a) {
					expect(a).toEqual(a1.concat(a2));
				});
		});

		it('should satisfy left identity', function() {
			var s = Stream.of(sentinel).concat(Stream.empty());

			return s.reduce(function(count, x) {
				expect(x).toBe(sentinel);
				return count + 1;
			}, 0).then(function(count) {
				expect(count).toBe(1);
			});
		});

		it('should satisfy right identity', function() {
			var s = Stream.empty().concat(Stream.of(sentinel));

			return s.reduce(function(count, x) {
				expect(x).toBe(sentinel);
				return count + 1;
			}, 0).then(function(count) {
				expect(count).toBe(1);
			});
		});

	});

	describe('take', function() {

		it('should take first n elements', function () {
			return repeat(sentinel)
				.take(2)
				.reduce(function (count) {
					return count + 1;
				}, 0).then(function (count) {
					expect(count).toBe(2);
				});
		});
	});

	describe('takeWhile', function() {
		it('should take elements until condition becomes false', function() {
			return iterate(function(x) {
				return x + 1;
			}, 0).takeWhile(function(x) {
				return x < 10;
			}).reduce(function(count, x) {
				expect(x).toBeLessThan(10);
				return count + 1;
			}, 0).then(function(count) {
				expect(count).toBe(10);
			});
		});

	});

	describe('scan', function() {
		it('should yield combined values', function() {
			var i = 0;
			var expected = ['a','b','c'];
			return Stream.from(expected).scan(function(arr, x) {
				return arr.concat(x);
			}, []).observe(function(arr) {
				++i;
				expect(arr).toEqual(expected.slice(0, i));
			});
		});
	});

	describe('reduce', function() {

		describe('when stream is empty', function() {

			it('should reduce to initial', function() {
				return Stream.empty().reduce(function() {
					throw new Error();
				}, sentinel).then(function(result) {
					expect(result).toBe(sentinel);
				});
			});

		});

		describe('when stream errors', function() {

			it('should reject', function() {
				return iterate(function() {
					throw sentinel;
				}).reduce(function() {
					return other;
				}).catch(function(e) {
					expect(e).toBe(sentinel);
				});
			});

		});

		it('should reduce values', function() {
			return Stream.from(['b', 'c', 'd'])
				.reduce(function(s, x) {
					return s+x;
				}, 'a')
				.then(function(s) {
					expect(s).toBe('abcd');
				});
		});

	});

	describe('delay', function() {
		it('should delay events by delayTime', function() {
			var scheduler = createTestScheduler();

			var result = Stream.of(sentinel).delay(100, scheduler).observe(function(x) {
				expect(x).toBe(sentinel);
				expect(scheduler.now()).toBe(100);
			});

			scheduler.tick(100);
			return result;
		});
	});

	describe('periodic', function() {
		it('should emit events at tick periods', function() {
			var scheduler = createTestScheduler();

			var count = 5;
			var result = Stream.periodic(1, scheduler)
				.take(count)
				.reduce(function(c) {
					return c - 1;
				}, count).then(function(count) {
					expect(count).toBe(0);
				});

			scheduler.tick(10, 1);
			return result;
		});
	});

	describe('debounce', function() {
		it('should exclude items during debounce period', function() {
			var scheduler = createTestScheduler();

			var result = Stream.periodic(1, scheduler)
				.take(5)
				.debounce(1, scheduler)
				.forEach(function(x) {
					expect(x % 2 === 0).toBeTrue();
				});

			scheduler.tick(10, 1);
			return result;
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
//
//	describe('throttle', function() {
//
//		it('should emit the most recent element', function(done) {
//			var spy = this.spy();
//			new Stream(function(next, end) {
//				next(other);
//				next(other);
//				next(other);
//				next(other);
//				next(sentinel);
//				setTimeout(end, 20);
//			}).throttle(10).observe(spy, function() {
//				expect(spy).toHaveBeenCalledOnceWith(sentinel);
//				done();
//			});
//		});
//
//		it('should allow only 1 item within the interval', function(done) {
//			var spy = this.spy();
//			new Stream(function(next, end) {
//				setTimeout(function() {
//					next(other);
//				}, 0);
//				setTimeout(function() {
//					next(sentinel);
//				}, 10);
//				setTimeout(function() {
//					next(other);
//				}, 20);
//				setTimeout(function() {
//					next(sentinel);
//				}, 30);
//
//				setTimeout(end, 100);
//			}).throttle(15).observe(function(x) {
//				expect(x).toBe(sentinel);
//			}, done);
//		});
//
//		it('should throttle even with infinite stream', function(done) {
//			var s  = Stream.iterate(function(x) {return x+1;}, 1).throttle(5);
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

});
