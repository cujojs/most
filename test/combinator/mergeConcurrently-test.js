require('buster').spec.expose();
var expect = require('buster').expect;

var mergeConcurrently = require('../../lib/combinator/mergeConcurrently').mergeConcurrently;
var periodic = require('../../lib/source/periodic').periodic;
var take = require('../../lib/combinator/slice').take;
var just = require('../../lib/source/core').of;
var core = require('../../lib/source/core');
var fromArray = require('../../lib/source/fromArray').fromArray;
var TestScheduler = require('../helper/TestScheduler');

var sentinel = { value: 'sentinel' };

describe('mergeConcurrently', function() {
	it('should be identity for 1 stream', function() {
		var s = mergeConcurrently(1, just(periodic(1, sentinel)));

		var n = 3;
		var scheduler = new TestScheduler();
		scheduler.tick(n);

		return scheduler.collect(take(n, s)).then(function(events) {
			expect(events).toEqual([
				{ time: 0, value: sentinel },
				{ time: 1, value: sentinel },
				{ time: 2, value: sentinel }
			]);
		});
	});

	it('should merge all when number of streams <= concurrency', function() {
		var streams = [periodic(1, 1), periodic(1, 2), periodic(1, 3)];
		var s = mergeConcurrently(streams.length, fromArray(streams));

		var n = 3;
		var scheduler = new TestScheduler();
		scheduler.tick(n);

		return scheduler.collect(take(n*streams.length, s)).then(function(events) {
			expect(events).toEqual([
				{ time: 0, value: 1 },
				{ time: 0, value: 2 },
				{ time: 0, value: 3 },
				{ time: 1, value: 1 },
				{ time: 1, value: 2 },
				{ time: 1, value: 3 },
				{ time: 2, value: 1 },
				{ time: 2, value: 2 },
				{ time: 2, value: 3 }
			]);
		});

	});

	it('should merge up to concurrency', function() {
		var n = 3;
		var m = 2;

		var streams = [take(n, periodic(1, 1)), take(n, periodic(1, 2)), take(n, periodic(1, 3))];
		var s = mergeConcurrently(m, fromArray(streams));

		var scheduler = new TestScheduler();
		scheduler.tick(m*n);

		return scheduler.collect(take(n*streams.length, s)).then(function(events) {
			expect(events).toEqual([
				{ time: 0, value: 1 },
				{ time: 0, value: 2 },
				{ time: 1, value: 1 },
				{ time: 1, value: 2 },
				{ time: 2, value: 1 },
				{ time: 2, value: 2 },
				{ time: 2, value: 3 },
				{ time: 3, value: 3 },
				{ time: 4, value: 3 }
			]);
		});

	});
});
