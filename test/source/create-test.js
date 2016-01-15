require('buster').spec.expose();
var expect = require('buster').expect;

var create = require('../../lib/source/create').create;
var streamOf = require('../../lib/source/core').of;
var until = require('../../lib/combinator/timeslice').takeUntil;
var delay = require('../../lib/combinator/delay').delay;
var observe = require('../../lib/combinator/observe').observe;
var flatMapError = require('../../lib/combinator/errors').flatMapError;

var te = require('../helper/testEnv');

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
		var spy = this.spy();
		function producer(add, end) {
			add(sentinel);
			end();
			add(other);

			return spy();
		}

		var count = 0;

		return observe(function(x) {
			count++;
			expect(x).toBe(sentinel);
		}, create(producer)).then(function() {
			expect(count).toBe(1);
			expect(spy).toHaveBeenCalled();
		});
	});

	it('should prevent events after dispose', function() {
		var env = te.newEnv();

		var endlessStream = create(function(add) {
			add(1);
			env.scheduler.delay(2, {
				run: function() { add(2); }
			});
		});

		var s = until(delay(1, streamOf()), endlessStream);

		return te.collectEvents(s, env.tick(2)).then(function(events) {
			expect(events.length).toBe(1);
			expect(events[0].value).toBe(1);
		});
	});

	it('should propagate error thrown synchronously from publisher', function() {
		var s1 = create(function() {
			throw sentinel;
		});

		var s2 = flatMapError(function(e) {
			expect(e).toBe(sentinel);
			return streamOf(other);
		}, s1);

		return observe(function(x) {
			expect(x).toBe(other);
		}, s2);
	});

});
