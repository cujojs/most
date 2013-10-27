require('buster').spec.expose();
var expect = require('buster').expect;

var Stream = require('../Stream');
var sentinel = { value: 'sentinel' };

describe('Stream', function() {

	describe('each', function() {
		it('should call emitter', function() {
			var spy = this.spy();

			new Stream(spy).each(function() {});
			expect(spy).toHaveBeenCalled();
		});
	});

	describe('of', function() {
		it('should create a stream of one item', function(done) {
			Stream.of(sentinel).each(done(function(x) {
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

			s2.each(done(function(x) {
				expect(x).toBe(sentinel);
			}));
		})
	});

	describe('map', function() {
		it('should return a new stream', function() {
			var s1 = Stream.of();
			var s2 = s1.map(function(){});

			expect(s2).not.toBe(s1);
			expect(s2 instanceof s1.constructor).toBeTrue();
		});

		it('should transform stream items', function(done) {
			var s = Stream.of();

			s = s.map(function() {
				return sentinel;
			});

			s.each(function(x) {
				expect(x).toBe(sentinel);
				done();
			});
		});
	});

	describe('flatMap', function() {
		it('should return a new stream', function() {
			var s1 = Stream.of();
			var s2 = s1.flatMap(function(){});

			expect(s2).not.toBe(s1);
			expect(s2 instanceof s1.constructor).toBeTrue();
		});

		it('should be lazy', function(done) {
			var s = Stream.of();

			s = s.flatMap(function() {
				return Stream.of(sentinel);
			});

			s.each(function(x) {
				expect(x).toBe(sentinel);
				done();
			});
		});

		it('should transform stream items', function(done) {
			var a = {};
			var b = {};
			function f() {
				return Stream.of(a);
			}

			function g() {
				return Stream.of(b);
			}

			var s1 = Stream.of(sentinel).flatMap(f).flatMap(g);
			var s2 = Stream.of(sentinel).flatMap(function(x) {
				return f(x).flatMap(g);
			});

			s1.each(function(result1) {
				s2.each(function(result2) {
					expect(result1).toBe(result2);
					done();
				});
			});
		});
	});

	describe('flatten', function(done) {
		it('should flatten stream of stream of x to stream of x', function(done) {
			var s = Stream.of(Stream.of(sentinel)).flatten();
			s.each(function(x) {
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

			s.each(function(x) {
				expect(x).toBe(sentinel);
				done();
			});
		})
	})

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

			s.each(function(x) {
				expect(x).not.toBeDefined();
				done();
			});
		});
	});

});
