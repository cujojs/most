require('buster').spec.expose();
var expect = require('buster').expect;

var Maybe = require('../Maybe');
var sentinel = { value: 'sentinel' };

describe('Maybe', function() {

	describe('fromMaybe', function() {

		it('should return the value of Maybe', function() {
			var maybe = Maybe.of(sentinel);
			expect(Maybe.fromMaybe(maybe, "")).toEqual(sentinel);
		});

		it('should return the default value when Nothing', function() {
			var maybe = Maybe.of(void 0);
			expect(Maybe.fromMaybe(maybe, sentinel)).toEqual(sentinel);
		});

	});

	describe('listToMaybe', function() {

		it('should return Just with the value of the first element', function() {
			expect(Maybe.listToMaybe([1, 2, 3])).toEqual(Maybe.of(1));
		});

		it('should return Nothing with a null array', function() {
			expect(Maybe.listToMaybe(null)).toEqual(Maybe.of(void 0));
		});

		it('should return Nothing for an empty array', function() {
			expect(Maybe.listToMaybe([])).toEqual(Maybe.of(void 0));
		});

	});

	describe('listToMaybe', function() {

		it('should return an array of one element with its Just value', function() {
			expect(Maybe.maybeToList(Maybe.of(1))).toEqual([1]);
		});

		it('should return an empty array for Nothing', function() {
			expect(Maybe.maybeToList(Maybe.of(void 0))).toEqual([]);
		});

		it('should return Nothing for an empty array', function() {
			expect(Maybe.listToMaybe([])).toEqual(Maybe.of(void 0));
		});

	});

	describe('catMaybes', function() {

		it('should return the Just values', function() {
			expect(Maybe.catMaybes([Maybe.of(1), Maybe.of(2)])).toEqual([1, 2]);
		});

		it('should filter the Nothing', function() {
			expect(Maybe.catMaybes([Maybe.of(1), Maybe.of(void 0), Maybe.of(2)])).toEqual([1, 2]);
		});

	});

	describe('bind ', function() {

		it('should bind', function() {
			expect(Maybe.of(1).flatMap(function(x) {return Maybe.of(x+1);}).getOrElse()).toEqual(2);
		});

		it('bind test with null', function() {
			expect(Maybe.of(void 0).flatMap(function(x) {return Maybe.of(x+1);}).getOrElse()).toEqual(void 0);
		});

	});

	describe('map', function() {

		it('map', function() {
			expect(Maybe.of(1).map(function(x) {return x+1;}).getOrElse()).toEqual(2);
		});

		it('should map test with undefined', function() {
			expect(Maybe.of(void 0).map(function(x) {return x+1;}).getOrElse()).toEqual(void 0);
		});
		
		it('should satisfy identity', function() {
			// u.map(function(a) { return a; })) ~= u
			var u = Maybe.of(sentinel);
			expect(u.map(function(x) { return x; }).getOrElse()).toEqual(u.getOrElse());
		});

		it('should satisfy composition', function() {
			//u.map(function(x) { return f(g(x)); }) ~= u.map(g).map(f)
			function f(x) { return x + 'f'; }
			function g(x) { return x + 'g'; }

			var u = Maybe.of('e');
			expect(u.map(function(x) { return f(g(x)); }).getOrElse()).toEqual(u.map(g).map(f).getOrElse());
		});

	});

	describe('filter', function() {

		it('filter test with Nothing', function() {
			expect(Maybe.of(void 0).filter(function(x) {return x > 1;}).getOrElse()).toEqual(void 0);
		});

		it('filter test with only false return', function() {
			expect(Maybe.of(0).filter(function(x) {return x > 1;}).getOrElse()).toEqual(void 0);
		});

		it('filter test with true', function() {
			expect(Maybe.of(2).filter(function(x) {return x > 1;}).getOrElse()).toEqual(2);
		});

	});
});