require('buster').spec.expose();
var expect = require('buster').expect;
var assertSame = require('./helper/stream-helper').assertSame;

var transform = require('../lib/combinator/transform');
var observe = require('../lib/combinator/observe').observe;
var streamOf = require('../lib/source/core').of;

var map = transform.map;
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
