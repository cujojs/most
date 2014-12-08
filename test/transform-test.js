require('buster').spec.expose();
var expect = require('buster').expect;
var assertSame = require('./helper/stream-helper').assertSame;

var transform = require('../lib/combinator/transform');
var observe = require('../lib/combinator/observe').observe;
var delay = require('../lib/combinator/delay').delay;
var reduce = require('../lib/combinator/accumulate').reduce;
var streamOf = require('../lib/source/core').of;

var map = transform.map;
var ap = transform.ap;
var flatMap = transform.flatMap;
var tap = transform.tap;
var constant = transform.constant;

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

describe('map', function() {

	it('should satisfy identity', function() {
		// u.map(function(a) { return a; })) ~= u
		var u = streamOf(sentinel);
		return assertSame(map(function(x) { return x; }, u), u);
	});

	it('should satisfy composition', function() {
		//u.map(function(x) { return f(g(x)); }) ~= u.map(g).map(f)
		function f(x) { return x + 'f'; }
		function g(x) { return x + 'g'; }

		var u = streamOf('e');

		return assertSame(
			map(function(x) { return f(g(x)); }, u),
			map(f, map(g, u))
		);
	});

});


describe('constant', function() {

	it('should satisfy identity', function() {
		// u.constant(x) ~= u.map(function(){return x;})
		var u = streamOf('e');
		var x = 1;
		function f() { return x; }
		return assertSame(
			constant(x, u),
			map(f, u)
		);
	});

});

describe('tap', function() {

	it('should not transform stream items', function() {
		var s = tap(function() {
			return other;
		}, streamOf(sentinel));

		return observe(function(x) {
			expect(x).toBe(sentinel);
		}, s);
	});

});

describe('ap', function() {

	it('should satisfy identity', function() {
		// P.of(function(a) { return a; }).ap(v) ~= v
		var v = streamOf(sentinel);
		return assertSame(ap(streamOf(function(x) { return x; }), v), v);
	});

	it('should satisfy composition', function() {
		//P.of(function(f) { return function(g) { return function(x) { return f(g(x))}; }; }).ap(u).ap(v
		var u = streamOf(function(x) { return 'u' + x; });
		var v = streamOf(function(x) { return 'v' + x; });
		var w = streamOf('w');

		return assertSame(
			ap(ap(ap(streamOf(function(f) {
				return function(g) {
					return function(x) {
						return f(g(x));
					};
				};
			}), u), v), w),
			ap(u, ap(v, w))
		);
	});

	it('should satisfy homomorphism', function() {
		//P.of(f).ap(P.of(x)) ~= P.of(f(x)) (homomorphism)
		function f(x) { return x + 'f'; }
		var x = 'x';
		return assertSame(ap(streamOf(f), streamOf(x)), streamOf(f(x)));
	});

	it('should satisfy interchange', function() {
		// u.ap(a.of(y)) ~= a.of(function(f) { return f(y); }).ap(u)
		function f(x) { return x + 'f'; }

		var u = streamOf(f);
		var y = 'y';

		return assertSame(
			ap(u, streamOf(y)),
			ap(streamOf(function(f) { return f(y); }), u)
		);
	});

});

//describe('scan', function() {
//	it('should yield combined values', function() {
//		var i = 0;
//		var items = 'abcd';
//
//		var stream = scan(function (s, x) {
//			return s + x;
//		}, items[0], Stream.from(items.slice(1)));
//
//		return observe(function(s) {
//			++i;
//			expect(s).toEqual(items.slice(0, i));
//		}, stream);
//	});
//
//	it('should dispose', function() {
//		var dispose = this.spy();
//
//		var items = new Stream.Yield(0, 0, new Stream.End(1, 0, sentinel));
//
//		var stream = new Stream(function(x) {
//			return x;
//		}, items, void 0, dispose);
//
//		var s = scan(function(z, x) { return x; }, 0, stream);
//		return observe(function() {}, s).then(function() {
//			expect(dispose).toHaveBeenCalledWith(1, 0, sentinel);
//		});
//	});
//});

