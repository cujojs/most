require('buster').spec.expose();
var assertSame = require('../helper/stream-helper').assertSame;

var applicative = require('../../lib/combinator/applicative');
var streamOf = require('../../lib/source/core').of;

var ap = applicative.ap;

var sentinel = { value: 'sentinel' };

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
