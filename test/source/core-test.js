require('buster').spec.expose();
var expect = require('buster').expect;

var core = require('../../lib/source/core');
var observe = require('../../lib/combinator/observe').observe;

var sentinel = { value: 'sentinel' };

describe('of', function() {

	it('should contain one item', function() {
		return observe(function(x) {
			expect(x).toBe(sentinel);
		}, core.of(sentinel));
	});

});

describe('empty', function() {

	it('should yield no items before end', function() {
		return observe(function(x) {
			throw new Error('not empty ' + x);
		}, core.empty()).then(function() {
			expect(true).toBeTrue();
		});
	});

});