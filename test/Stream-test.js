require('buster').spec.expose();
var expect = require('buster').expect;

var Stream = require('../Stream');
var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

function assertSame(done, p1, p2) {
	p1.forEach(function(x) {
		p2.forEach(function(y) {
			expect(x).toBe(y);
			done();
		});
	});
}

describe('Stream', function() {

	describe('forEach', function() {
		it('should call emitter in future stack', function(done) {
			var spy = this.spy();

			new Stream(spy).forEach(function() {});

			expect(spy).not.toHaveBeenCalled();

			setTimeout(function() {
				expect(spy).toHaveBeenCalled();
				done();
			}, 10);
		});

		it('should call next in future stack', function(done) {
			var spy = this.spy();

			new Stream(function(next) {
				next(sentinel);
			}).forEach(spy);

			expect(spy).not.toHaveBeenCalled();

			setTimeout(function() {
				expect(spy).toHaveBeenCalled();
				done();
			}, 10);
		});

		it('should call end in future stack', function(done) {
			var spy = this.spy();

			new Stream(function(_, end) {
				end();
			}).forEach(void 0, spy);

			expect(spy).not.toHaveBeenCalled();

			setTimeout(function() {
				expect(spy).toHaveBeenCalled();
				done();
			}, 10);
		});

		it('should never call end after end', function(done) {
			var spy = this.spy();

			new Stream(function(_, end) {
				end();
				end();
			}).forEach(void 0, spy);

			setTimeout(function() {
				expect(spy).toHaveBeenCalledOnce();
				done();
			}, 0);
		});

		it('should never call next after end', function(done) {
			var spy = this.spy();

			new Stream(function(next, end) {
				end();
				next();
			}).forEach(spy);

			setTimeout(function() {
				expect(spy).not.toHaveBeenCalled();
				done();
			}, 0);
		});

	});

	describe('unsubscribe', function() {

		it('should call returned unsubscriber function', function(done) {
			var unsubSpy = this.spy();

			var unsubscribe = new Stream(function() {
				return unsubSpy;
			}).forEach();

			unsubscribe();

			setTimeout(function() {
				expect(unsubSpy).toHaveBeenCalled();
				done();
			}, 10);
		});


		it('should unsubscribe', function(done) {
			var nextSpy = this.spy();

			var unsubscribe = new Stream(function(next) {
				var unsub;

				next();
				setTimeout(function() {
					if(!unsub) {
						next();
					}
				}, 50);

				return function() {
					unsub = true;
				};
			}).forEach(nextSpy);

			setTimeout(function() {
				unsubscribe();
			}, 10);

			setTimeout(function() {
				expect(nextSpy).toHaveBeenCalledOnce();
				done();
			}, 100);
		});

		it('should unsubscribe immediately', function(done) {
			var nextSpy = this.spy();
			var unsubSpy = this.spy();

			var unsubscribe = new Stream(function(next) {
				next();
				return unsubSpy;
			}).forEach(nextSpy);

			unsubscribe();

			setTimeout(function() {
				expect(nextSpy).not.toHaveBeenCalled();
				expect(unsubSpy).toHaveBeenCalled();
				done();
			}, 10);
		});
	});

	describe('of', function() {

		it('should create a stream of one item', function(done) {
			Stream.of(sentinel).forEach(done(function(x) {
				expect(x).toBe(sentinel);
			}));
		});

	});

	describe('catch', function() {

		it('should catch errors', function(done) {
			var s1 = Stream.of({}).map(function() {
				throw sentinel;
			});

			var s2 = s1.catch(function(x) {
				return x;
			});

			s2.forEach(done(function(x) {
				expect(x).toBe(sentinel);
			}));
		});

	});

	describe('map', function() {

		it('should satisfy identity', function(done) {
			// u.map(function(a) { return a; })) ~= u
			var u = Stream.of(sentinel);
			assertSame(done, u.map(function(x) { return x; }), u);
		});

		it('should satisfy composition', function(done) {
			//u.map(function(x) { return f(g(x)); }) ~= u.map(g).map(f)
			function f(x) { return x + 'f'; }
			function g(x) { return x + 'g'; }

			var u = Stream.of('e');

			assertSame(done,
				u.map(function(x) { return f(g(x)); }),
				u.map(g).map(f)
			);
		});

	});

	describe('flatMap', function() {

		it('should satisfy associativity', function(done) {
			// m.flatMap(f).flatMap(g) ~= m.flatMap(function(x) { return f(x).flatMap(g); })
			function f(x) { return Stream.of(x + 'f'); }
			function g(x) { return Stream.of(x + 'g'); }

			var m = Stream.of('m');

			assertSame(done,
				m.flatMap(function(x) { return f(x).flatMap(g); }),
				m.flatMap(f).flatMap(g)
			);
		});

		it('should call end on error', function(done) {
			var nextSpy = this.spy();

			Stream.of(other).flatMap(function() {
				return new Stream(function(_, end) {
					end(sentinel);
				});
			}).forEach(nextSpy, function(e) {
				expect(nextSpy).not.toHaveBeenCalled();
				expect(e).toBe(sentinel);
				done();
			});
		});

		it('should not call end when no error', function(done) {
			var nextSpy = this.spy();

			new Stream(function(next, end) {
				next();
				next();
				end();
			}).flatMap(function(x) {
				return new Stream(function(next, end) {
					next(x);
					end();
				});
			}).forEach(nextSpy, function(e) {
				expect(e).not.toBeDefined();
				expect(nextSpy).toHaveBeenCalledTwice();
				done();
			});
		});
	});

	describe('ap', function() {

		it('should satisfy identity', function(done) {
			// P.of(function(a) { return a; }).ap(v) ~= v
			var v = Stream.of(sentinel);
			assertSame(done, Stream.of(function(x) { return x; }).ap(v), v);
		});

		it('should satisfy composition', function(done) {
			//P.of(function(f) { return function(g) { return function(x) { return f(g(x))}; }; }).ap(u).ap(v
			var u = Stream.of(function(x) { return 'u' + x; });
			var v = Stream.of(function(x) { return 'v' + x; });
			var w = Stream.of('w');

			assertSame(done, Stream.of(function(f) {
				return function(g) {
					return function(x) {
						return f(g(x));
					};
				};
			}).ap(u).ap(v).ap(w),
				u.ap(v.ap(w))
			);
		});

		it('should satisfy homomorphism', function(done) {
			//P.of(f).ap(P.of(x)) ~= P.of(f(x)) (homomorphism)
			function f(x) { return x + 'f'; }
			var x = 'x';
			assertSame(done, Stream.of(f).ap(Stream.of(x)), Stream.of(f(x)));
		});

		it('should satisfy interchange', function(done) {
			// u.ap(a.of(y)) ~= a.of(function(f) { return f(y); }).ap(u)
			function f(x) { return x + 'f'; }

			var u = Stream.of(f);
			var y = 'y';

			assertSame(done,
				u.ap(Stream.of(y)),
				Stream.of(function(f) { return f(y); }).ap(u)
			);
		});

	});

	describe('flatten', function() {

		it('should flatten stream of stream of x to stream of x', function(done) {
			var s = Stream.of(Stream.of(sentinel)).flatten();
			s.forEach(function(x) {
				expect(x).toBe(sentinel);
				done();
			});
		});

	});

	describe('filter', function() {

		it('should return a stream containing only allowed items', function(done) {
			var s = new Stream(function(next) {
				[sentinel, {}].forEach(next);
			}).filter(function(x) {
				return x === sentinel;
			});

			s.forEach(function(x) {
				expect(x).toBe(sentinel);
				done();
			});
		});

	});

	describe('merge', function() {

		it('should contain items from both', function(done) {
			var result = [];
			Stream.of(1).merge(Stream.of(2))
				.forEach(function(x) {
					result.push(x);
				}, function(e) {
					expect(e).not.toBeDefined();
					expect(result).toEqual([1, 2]);
					done();
				});
		});

		it('should end immediately on error', function(done) {
			var nextSpy = this.spy();

			new Stream(function(next, end) {
				end(sentinel);
			})
				.merge(Stream.of())
				.forEach(nextSpy, function(e) {
					expect(nextSpy).not.toHaveBeenCalled();
					expect(e).toBe(sentinel);
					done();
				});
		});

		it('should not call end when no error', function(done) {
			var nextSpy = this.spy();

			new Stream(function(next, end) {
				next();
				end();
			}).merge(new Stream(function(next, end) {
					next();
					end();
			})).forEach(nextSpy, function(e) {
				expect(e).not.toBeDefined();
				expect(nextSpy).toHaveBeenCalledTwice();
				done();
			});
		});
	});

	describe('concat', function() {

		it('should return a stream containing items from concatenated streams in correct order', function(done) {
			var s1 = Stream.of(sentinel);
			var s2 = Stream.of(1);

			var results = [];
			s1.concat(s2).forEach(function(x) {
				results.push(x);
			}, function() {
				expect(results).toEqual([sentinel, 1]);
				done();
			});
		});

		it('should satisfy left identity', function(done) {
			var spy = this.spy();
			var s = Stream.of(sentinel).concat(Stream.empty());

			s.forEach(spy, function() {
				expect(spy).toHaveBeenCalledOnceWith(sentinel);
				done();
			});
		});

		it('should satisfy right identity', function(done) {
			var spy = this.spy();
			var s = Stream.empty().concat(Stream.of(sentinel));

			s.forEach(spy, function() {
				expect(spy).toHaveBeenCalledOnceWith(sentinel);
				done();
			});
		});

	});

	describe('tap', function() {

		it('should return a new stream', function() {
			var s1 = Stream.of();
			var s2 = s1.tap(function(){});

			expect(s2).not.toBe(s1);
			expect(s2 instanceof s1.constructor).toBeTrue();
		});

		it('should not transform stream items', function(done) {
			var s = Stream.of();

			s = s.tap(function() {
				return sentinel;
			});

			s.forEach(function(x) {
				expect(x).not.toBeDefined();
				done();
			});
		});

	});

	describe('take', function() {

		it('should take only the first two elements', function(done) {
			var values = [1, 2, 3];
			var s1 = new Stream(function(next, end) {
				values.forEach(next);
				end();
			});

			var s2 = s1.take(2);
			expect(s2).not.toBe(s1);
			expect(s2 instanceof s1.constructor).toBeTrue();

			var result = [];
			s2.forEach(function(x) {
				result.push(x);
			}, function() {
				expect(result).toEqual([1, 2]);
				done();
			});

		});

		it('should take only the first two elements with condition', function(done) {
			var values = [1, 2, 3];
			var s1 = new Stream(function(next, end) {
				values.forEach(next);
				end();
			});

			var s2 = s1.takeWhile(function(x) {
				return x < 3;
			});

			expect(s1).not.toBe(s2);
			expect(s2 instanceof s1.constructor).toBeTrue();

			var result = [];
			s2.forEach(function(x) {
				result.push(x);
			}, function() {
				expect(result).toEqual([1, 2]);
				done();
			});

		});
	});

	describe('drop', function() {

		it('should take only the last two elements', function(done) {
			var values = [1, 2, 3];
			var s1 = new Stream(function(next, end) {
				values.forEach(next);
				end();
			});

			var s2 = s1.drop(1);
			expect(s1).not.toBe(s2);
			expect(s2 instanceof s1.constructor).toBeTrue();

			var result = [];
			s2.forEach(function(x) {
				result.push(x);
			}, function() {
				expect(result).toEqual([2, 3]);
				done();
			});

		});

		it('should take only the last two elements with condition', function(done) {
			var values = [1, 2, 3];
			var s1 = new Stream(function(next, end) {
				values.forEach(next);
				end();
			});

			var s2 = s1.dropWhile(function(x) {
				return x < 2;
			});

			expect(s1).not.toBe(s2);
			expect(s2 instanceof s1.constructor).toBeTrue();

			var result = [];
			s2.forEach(function(x) {
				result.push(x);
			}, function() {
				expect(result).toEqual([2, 3]);
				done();
			});

		});
	});

	describe('reduce', function() {

		describe('when stream is empty', function() {
			it('should reduce to initial', function(done) {
				Stream.empty().reduce(function() {
					throw new Error();
				}, sentinel).forEach(function(result) {
					expect(result).toBe(sentinel);
					done();
				});
			});

			it('should call end', function(done) {
				Stream.empty().reduce(function() {
					throw new Error();
				}, sentinel).forEach(
					function(){},
					function(e) {
						expect(e).not.toBeDefined();
						done();
					}
				);
			});
		});

		describe('when stream errors', function() {
			it('should call end with error', function(done) {
				new Stream(function(_, end) {
					end(sentinel);
				}).reduce(function() {
					throw new Error();
				}, other).forEach(function() {
						throw new Error();
				}, function(e) {
					expect(e).toBe(sentinel);
					done();
				});
			});
		});

		it('should reduce values', function(done) {
			var values = [1, 2, 3];
			new Stream(function(next, end) {
				values.forEach(next);
				end();
			}).reduce(function(a, x) {
				return a.concat(x);
			}, []).forEach(function(result) {
				expect(result).toEqual(values);
				done();
			});
		});
	});

	describe('reduceRight', function() {

		describe('when stream is empty', function() {
			it('should reduce to initial', function(done) {
				Stream.empty().reduceRight(function() {
					throw new Error();
				}, sentinel).forEach(function(result) {
					expect(result).toBe(sentinel);
					done();
				});
			});

			it('should call end', function(done) {
				Stream.empty().reduceRight(function() {
					throw new Error();
				}, sentinel).forEach(
					function(){},
					function(e) {
						expect(e).not.toBeDefined();
						done();
					}
				);
			});
		});

		describe('when stream errors', function() {
			it('should call end with error', function(done) {
				new Stream(function(_, end) {
					end(sentinel);
				}).reduceRight(function() {
					throw new Error();
				}, other).forEach(function() {
						throw new Error();
				}, function(e) {
					expect(e).toBe(sentinel);
					done();
				});
			});
		});

		it('should reduce values', function(done) {
			var values = [1, 2, 3];
			new Stream(function(next, end) {
				values.forEach(next);
				end();
			}).reduceRight(function(a, x) {
				return a + x;
			}, '0').forEach(function(result) {
				expect(result).toEqual('0321');
				done();
			});
		});
	});

	describe('bufferCount', function() {

		it('should should buffer N items', function(done) {
			var spy = this.spy();

			new Stream(function(next, end) {
				next(1);
				next(2);
				expect(spy).not.toHaveBeenCalled();
				next(3);
				expect(spy).toHaveBeenCalledWith([1,2,3]);
				next(4);
				expect(spy).not.toHaveBeenCalledTwice();
				end();
			}).bufferCount(3).forEach(spy, done);
		});

	});

	describe('bufferTime', function() {

		it('should should buffer items in time window', function(done) {
			var spy = this.spy();

			new Stream(function(next, end) {
				next(1);
				setTimeout(function() {
					next(2);
				}, 50);

				setTimeout(function() {
					next(3);
				}, 150);

				setTimeout(function() {
					expect(spy).not.toHaveBeenCalled();
				}, 55);

				setTimeout(function() {
					expect(spy).toHaveBeenCalledWith([1,2]);
					end();
				}, 155);

			}).bufferTime(100).forEach(spy, done);
		});

	});

	describe('throttle', function() {

		it('should emit the most recent element', function(done) {
			var spy = this.spy();
			new Stream(function(next, end) {
				next(other);
				next(other);
				next(other);
				next(other);
				next(sentinel);
				setTimeout(end, 20);
			}).throttle(10).forEach(spy, function() {
				expect(spy).toHaveBeenCalledOnceWith(sentinel);
				done();
			});
		});

		it('should allow only 1 item within the interval', function(done) {
			var spy = this.spy();
			new Stream(function(next, end) {
				setTimeout(function() {
					next(other);
				}, 0);
				setTimeout(function() {
					next(sentinel);
				}, 10);
				setTimeout(function() {
					next(other);
				}, 20);
				setTimeout(function() {
					next(sentinel);
				}, 30);

				setTimeout(end, 100);
			}).throttle(15).forEach(function(x) {
				expect(x).toBe(sentinel);
			}, done);
		});
	});

});
