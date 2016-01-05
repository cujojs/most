require('buster').spec.expose();
var expect = require('buster').expect;

var timeslice = require('../lib/combinator/timeslice');
var take = require('../lib/combinator/slice').take;
var periodic = require('../lib/source/periodic').periodic;
var unfold = require('../lib/source/unfold').unfold;
var core = require('../lib/source/core');
var delay = require('../lib/combinator/delay').delay;
var Stream = require('../lib/Stream');
var merge = require('../lib/combinator/merge').merge;

var streamOf = core.of;
var never = core.never;

var TestScheduler = require('./helper/TestScheduler');
var FakeDisposeSource = require('./helper/FakeDisposeSource');

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

describe('during', function() {
	it('should contain events at or later than min and earlier than max', function() {
		var stream = periodic(1);
		var timespan = delay(1, streamOf(delay(5, streamOf())));

		var scheduler = new TestScheduler();
		scheduler.tick(6);

		return scheduler.collect(timeslice.during(timespan, stream))
			.then(function(events) {
				var len = events.length;
                expect(len).toBe(5);
				expect(events[0].time).toBe(1);
				expect(events[len-1].time).toBe(5);
			});
	});

	it('should dispose source stream', function() {
		var dispose = this.spy();
		var stream = new Stream(FakeDisposeSource.from(dispose, periodic(1)));
		var timespan = delay(1, streamOf(delay(5, streamOf())));

		var scheduler = new TestScheduler();
		scheduler.tick(6);

		return scheduler.collect(timeslice.during(timespan, stream))
			.then(function() {
				expect(dispose).toHaveBeenCalledOnce();
			});
	});

	it('should dispose signals', function() {
		var dispose = this.spy();

		var stream = periodic(1);
		var timespan = delay(1, streamOf(delay(5, streamOf())));
		var dt = new Stream(FakeDisposeSource.from(dispose, timespan));

		var scheduler = new TestScheduler();
		scheduler.tick(6);

		return scheduler.collect(timeslice.during(dt, stream))
			.then(function(events) {
				expect(events.length).toBe(5);
				expect(dispose).toHaveBeenCalledOnce();
			});
	});
});

describe('takeUntil', function() {
	it('should only contain events earlier than signal', function() {
		var stream = periodic(1);
		var signal = delay(3, streamOf());

		var scheduler = new TestScheduler();
		scheduler.tick(5);

		return scheduler.collect(timeslice.takeUntil(signal, stream))
			.then(function(events) {
				expect(events.length).toBe(3);
			});
	});

	it('should dispose source stream', function() {
		var dispose = this.spy();
		var stream = new Stream(FakeDisposeSource.from(dispose, periodic(1)));
		var signal = delay(3, streamOf());

		var scheduler = new TestScheduler();
		scheduler.tick(5);

		return scheduler.collect(timeslice.takeUntil(signal, stream))
			.then(function() {
				expect(dispose).toHaveBeenCalledOnce();
			});

	});

	it('should end immediately on signal', function() {
		var dispose = this.spy();
		var stream = new Stream(FakeDisposeSource.from(dispose, never()));
		var signal = streamOf();

		var scheduler = new TestScheduler();
		scheduler.tick(1);

		return scheduler.collect(timeslice.takeUntil(signal, stream))
			.then(function(events) {
				expect(events.length).toBe(0);
				expect(dispose).toHaveBeenCalledOnce();
			});

	});

	it('should dispose signal', function() {
		var dispose = this.spy();
		var stream = periodic(1);
		var signal = new Stream(FakeDisposeSource.from(dispose, delay(3, streamOf())));

		var scheduler = new TestScheduler();
		scheduler.tick(5);

		return scheduler.collect(timeslice.takeUntil(signal, stream))
			.then(function(events) {
				expect(events.length).toBe(3);
				expect(dispose).toHaveBeenCalledOnce();
			});
	});

	it('should use takeUntil value as end value', function() {
		var s = periodic(1);
		var end = delay(3, streamOf(sentinel));

		var scheduler = new TestScheduler();
		scheduler.tick(5);

		return scheduler.drain(timeslice.takeUntil(end, s))
			.then(function(x) {
				expect(x).toBe(sentinel);
			});
	});

});

describe('skipUntil', function() {
	it('should only contain events at or later than signal', function() {
		var n = 10;
		var stream = take(n, periodic(1));
		var signal = delay(3, streamOf());

		var scheduler = new TestScheduler();
		scheduler.tick(n);

		return scheduler.collect(timeslice.skipUntil(signal, stream))
			.then(function(events) {
				expect(events.length).toBe(7);
			});
	});

	it('should dispose signal', function() {
		var dispose = this.spy();
		var stream = take(10, periodic(1));
		var signal = new Stream(FakeDisposeSource.from(dispose, delay(3, streamOf())));

		var scheduler = new TestScheduler();
		scheduler.tick(10);

		return scheduler.collect(timeslice.skipUntil(signal, stream))
			.then(function(events) {
				expect(events.length).toBe(7);
				expect(dispose).toHaveBeenCalledOnce();
			});

	});

	it('should preserve end value', function() {
		var s = take(3, periodic(1, sentinel));
		var start = delay(3, streamOf());

		var scheduler = new TestScheduler();
		scheduler.tick(3);

		return scheduler.drain(timeslice.skipUntil(start, s))
			.then(function(x) {
				expect(x).toBe(sentinel);
			});
	});

	it('should allow end before start signal', function() {
		var s = take(3, periodic(1));
		var start = delay(3, streamOf());
		var end = delay(1, streamOf(sentinel));

		var scheduler = new TestScheduler();
		scheduler.tick(3);

		return scheduler.drain(timeslice.skipUntil(start, timeslice.takeUntil(end, s)))
			.then(function(x) {
				expect(x).toBe(sentinel);
			});
	});
});
