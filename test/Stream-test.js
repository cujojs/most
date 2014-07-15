require('buster').spec.expose();
var expect = require('buster').expect;

var Stream = require('../Stream');
var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

function assertSame(p1, p2) {
	return p1.forEach(function(x) {
		return p2.forEach(function(y) {
			expect(x).toBe(y);
		});
	});
}

describe('Stream', function() {

	beforeAll(function() {
		// This is for Node 0.11.13's Promise, which is astonishingly slow.
		// You really should use when.js's es6-shim
		this.timeout = 5000;
	});

	describe('forEach', function() {

		it('should call callback and return a promise', function() {
			var spy = this.spy();

			return Stream.of(sentinel)
				.forEach(spy)
				.then(function() {
					expect(spy).toHaveBeenCalledWith(sentinel);
				});
		});

		it('should end if consumer returns End', function() {
			var spy = this.spy(function(x) {
				return new Stream.End();
			});

			return Stream.from([sentinel, other])
				.forEach(spy)
				.then(function() {
					expect(spy).toHaveBeenCalledOnceWith(sentinel);
					expect(spy).not.toHaveBeenCalledWith(other);
				});
		});

	});


	describe('of', function() {

		it('should create a stream of one item', function() {
			return Stream.of(sentinel).forEach(function(x) {
				expect(x).toBe(sentinel);
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
			}).forEach(function(x) {
				expect(x).toBe(sentinel);
			});
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
			}).forEach(function(x) {
				expect(x).toBe(sentinel);
			});
		});

		it('should filter an infinite stream', function() {
			return Stream.iterate(function(x) {return x+1;}, 0)
				.filter(function(x) {
					return x % 2 === 0;
				})
				.forEach(function(x) {
					expect(x % 2 === 0).toBeTrue();
					if(x > 10) {
						return new Stream.End();
					}
				});
		});

	});

	describe('iterate', function() {

		it('should call iterator with seed', function() {
			return Stream.iterate(function(x) {
				return x;
			}, sentinel).forEach(function(x) {
				expect(x).toBe(sentinel);
				return new Stream.End();
			});
		});

		it('should iterate until end', function() {
			var count = 0;
			var expected = 3;

			return Stream.iterate(function(x) {
				return x - 1;
			}, expected).forEach(function(x) {
				if(x === 0) {
					return new Stream.End();
				}
				count++;
			}).then(function() {
				expect(count).toBe(expected);
			});
		});

		it('should reject on error', function() {
			return Stream.iterate(function() {
				throw sentinel;
			}, 1).forEach(function() {}).catch(function(e) {
				expect(e).toBe(sentinel);
			});
		});
	});

	describe('cycle', function() {

		it('should keep repeating', function() {
			var buffer = [];
			return Stream.from([1, 2, 3]).cycle().forEach(function(x) {
				buffer.push(x);
				if(buffer.length === 9) {
					return new Stream.End(buffer);
				}
			}).then(function(buffer) {
				expect(buffer).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3]);
			});
		});

		it('should end on error ', function() {
			return Stream.from([1, 2, 3]).cycle()
				.forEach(function() { throw sentinel; }).catch(function(e) {
					expect(e).toBe(sentinel);
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
			return Stream.repeat(sentinel)
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
			return Stream.iterate(function(x) {
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
				return Stream.iterate(function() {
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

//	describe('drop', function() {
//
//		it('should take only the last two elements', function(done) {
//			var values = [1, 2, 3];
//			var s1 = new Stream(function(next, end) {
//				values.forEach(next);
//				end();
//			});
//
//			var s2 = s1.drop(1);
//			expect(s1).not.toBe(s2);
//			expect(s2 instanceof s1.constructor).toBeTrue();
//
//			var result = [];
//			s2.forEach(function(x) {
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
//				values.forEach(next);
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
//			s2.forEach(function(x) {
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
//			}).forEach(function() {
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
//			fromArray([1, 2]).drop(1).forEach(nextSpy, function(e) {
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
//			}).bufferCount(3).forEach(spy, done);
//		});
//
//		it('should buffer N items even with infinite stream', function(done) {
//			var s  = Stream.iterate(function(x) {return x+1;}, 1).bufferCount(3);
//			var i = 0, result = [];
//			var unsubscribe = s.forEach(function(x) {
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
//			}).bufferTime(100).forEach(spy, done);
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
//			}).throttle(10).forEach(spy, function() {
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
//			}).throttle(15).forEach(function(x) {
//				expect(x).toBe(sentinel);
//			}, done);
//		});
//
//		it('should throttle even with infinite stream', function(done) {
//			var s  = Stream.iterate(function(x) {return x+1;}, 1).throttle(5);
//			var i = 0, result = [];
//			var unsubscribe = s.forEach(function(x) {
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
