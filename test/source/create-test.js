require('buster').spec.expose();
var expect = require('buster').expect;

var create = require('../../lib/source/create').create;
var observe = require('../../lib/combinators/observe').observe;

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

describe('create', function() {

	it('should not call producer immediately', function() {
		var spy = this.spy();
		create(spy);
		expect(spy).not.toHaveBeenCalled();
	});

	it('should call producer after first subscriber', function() {
		var spy = this.spy(function(add, end) {
			end();
		});

		return observe(function() {}, create(spy)).then(function() {
			expect(spy).toHaveBeenCalled();
		});
	});

	it('should contain added items', function() {
		function producer(add, end) {
			add(sentinel);
			add(sentinel);
			end();
		}

		var count = 0;

		return observe(function(x) {
			count++;
			expect(x).toBe(sentinel);
		}, create(producer)).then(function() {
			expect(count).toBe(2);
		});

	});

	it('should call disposer on end', function() {
		function producer(add, end) {
			add(sentinel);
			end();
			add(other);
		}

		var count = 0;

		return observe(function(x) {
			count++;
			expect(x).toBe(sentinel);
		}, create(producer)).then(function() {
			expect(count).toBe(1);
		});
	});
});