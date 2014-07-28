require('buster').spec.expose();
var expect = require('buster').expect;

var monoid = require('../lib/combinators/monoid');
var Stream = require('../lib/Stream');

var sentinel = { value: 'sentinel' };

describe('empty', function() {
	it('should yield no items before end', function() {
		return monoid.empty().observe(function(x) {
			throw new Error('not empty ' + x);
		}).then(function() {
			expect(true).toBeTrue();
		});
	});
});

describe('concat', function() {

	it('should return a stream containing items from both streams in correct order', function() {
		var a1 = [1,2,3];
		var a2 = [4,5,6];
		var s1 = Stream.from(a1);
		var s2 = Stream.from(a2);

		return monoid.concat(s1, s2)
			.reduce(function(a, x) {
				a.push(x);
				return a;
			}, []).then(function(a) {
				expect(a).toEqual(a1.concat(a2));
			});
	});

	it('should satisfy left identity', function() {
		var s = monoid.concat(Stream.of(sentinel), monoid.empty());

		return s.reduce(function(count, x) {
			expect(x).toBe(sentinel);
			return count + 1;
		}, 0).then(function(count) {
			expect(count).toBe(1);
		});
	});

	it('should satisfy right identity', function() {
		var s = monoid.concat(monoid.empty(), Stream.of(sentinel));

		return s.reduce(function(count, x) {
			expect(x).toBe(sentinel);
			return count + 1;
		}, 0).then(function(count) {
			expect(count).toBe(1);
		});
	});

});