require('buster').spec.expose();

var Stream = require('../Stream');
var sentinel = { value: 'sentinel' };

describe('Stream', function() {
	describe('each', function() {
		it('should call emitter', function() {
			var spy, next, end;

			spy = this.spy();
			next = function(){};
			end = function(){};

			new Stream(function(n, e) {
				expect(n).toBe(next);
				expect(e).toBe(end);
			}).each(next, end);
		});
	});

	describe('of', function() {
		it('should create a stream of one item', function() {
			var s = Stream.of(sentinel);
			var spy = this.spy();
			s.each(spy);

			expect(spy).toHaveBeenCalledOnceWith(sentinel);
			expect(spy).not.toHaveBeenCalledTwice();
		});
	});

	describe('map', function() {
		it('should return a new stream', function() {
			var s1 = Stream.of();
			var s2 = s1.map(function(){});

			expect(s2).not.toBe(s1);
			expect(s2 instanceof s1.constructor).toBeTrue();
		});

		it('should be lazy', function() {
			var s = Stream.of();
			var spy = this.spy();

			s = s.map(spy);
			expect(spy).not.toHaveBeenCalled();

			s.each(function() {
				expect(spy).toHaveBeenCalled();
			});
		});

		it('should transform stream items', function() {
			var expected = {};
			var s = Stream.of(sentinel).map(function(x) {
				expect(x).toBe(sentinel);
				return expected;
			});

			s.each(function(x) {
				expect(x).toBe(expected);
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

		it('should be lazy', function() {
			var s = Stream.of();
			var spy = this.spy();

			s = s.tap(spy);
			expect(spy).not.toHaveBeenCalled();

			s.each(function() {
				expect(spy).toHaveBeenCalled();
			});
		});

		it('should not transform stream items', function() {
			var expected = {};
			var s = Stream.of(sentinel).tap(function(x) {
				expect(x).toBe(sentinel);
				return expected;
			});

			s.each(function(x) {
				expect(x).toBe(sentinel);
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

		it('should be lazy', function() {
			var s = Stream.of();
			var spy = this.spy();

			s = s.flatMap(spy);
			expect(spy).not.toHaveBeenCalled();

			s.each(function() {
				expect(spy).toHaveBeenCalled();
			});
		});

		it('should transform stream items', function() {
			var a = {};
			var b = {};
			function f(x) {
				return Stream.of(a);
			}

			function g(x) {
				return Stream.of(b);
			}

			var s1 = Stream.of(sentinel).flatMap(f).flatMap(g);
			var s2 = Stream.of(sentinel).flatMap(function(x) {
				return f(x).flatMap(g);
			});

			s1.each(function(result1) {
				s2.each(function(result2) {
					expect(result1).toBe(result2);
				});
			});
		});
	});

});
