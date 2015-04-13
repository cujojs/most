require('buster').spec.expose();
var expect = require('buster').expect;

var timeslice = require('../lib/combinator/timeslice');
var take = require('../lib/combinator/slice').take;
var periodic = require('../lib/source/periodic').periodic;
var unfold = require('../lib/source/unfold').unfold;
var core = require('../lib/source/core');
var delay = require('../lib/combinator/delay').delay;
var reduce = require('../lib/combinator/accumulate').reduce;
var drain = require('../lib/combinator/observe').drain;
var Stream = require('../lib/Stream');

var streamOf = core.of;
var never = core.never;

var FakeDisposeSource = require('./helper/FakeDisposeSource');

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

describe('during', function() {
	it('should contain events at or later than min and earlier than max', function() {
		var stream = periodic(10);
		var timespan = delay(25, streamOf(delay(50, streamOf())));

		return reduce(function(count) {
			return count + 1;
		}, 0, timeslice.during(timespan, stream))
			.then(function(count) {
				expect(count).toBe(5);
			});
	});

	it('should dispose source stream', function() {
		var dispose = this.spy();
		var stream = new Stream(FakeDisposeSource.from(dispose, periodic(10)));
		var timespan = delay(30, streamOf(delay(45, streamOf())));

		return drain(timeslice.during(timespan, stream))
			.then(function() {
				expect(dispose).toHaveBeenCalledOnce();
			});

	});

	it('should dispose signals', function() {
		var dispose = this.spy();

		var stream = periodic(10);
		var timespan = delay(30, streamOf(delay(45, streamOf())));
		var dt = new Stream(FakeDisposeSource.from(dispose, timespan));

		return reduce(function(count) {
			return count + 1;
		}, 0, timeslice.during(dt, stream))
			.then(function(count) {
				expect(count).toBe(5);
				expect(dispose).toHaveBeenCalledOnce();
			});
	});
});

describe('takeUntil', function() {
	it('should only contain events earlier than signal', function() {
		var stream = periodic(10);
		var signal = delay(25, streamOf());

		return reduce(function(count) {
			return count + 1;
		}, 0, timeslice.takeUntil(signal, stream))
			.then(function(count) {
			expect(count).toBe(3);
		});
	});

	it('should dispose source stream', function() {
		var dispose = this.spy();
		var stream = new Stream(FakeDisposeSource.from(dispose, periodic(10)));
		var signal = delay(30, streamOf());

		return drain(timeslice.takeUntil(signal, stream))
			.then(function() {
				expect(dispose).toHaveBeenCalledOnce();
			});

	});

	it('should end immediately on signal', function() {
		var dispose = this.spy();
		var stream = new Stream(FakeDisposeSource.from(dispose, never()));
		var signal = streamOf();

		return drain(timeslice.takeUntil(signal, stream))
			.then(function() {
				expect(dispose).toHaveBeenCalledOnce();
			});

	});

	it('should dispose signal', function() {
		var dispose = this.spy();
		var stream = periodic(10);
		var signal = new Stream(FakeDisposeSource.from(dispose, delay(25, streamOf())));

		return reduce(function(count) {
			return count + 1;
		}, 0, timeslice.takeUntil(signal, stream))
			.then(function(count) {
				expect(count).toBe(3);
				expect(dispose).toHaveBeenCalledOnce();
			});
	});

	it('should use takeUntil value as end value', function() {
		var s = periodic(10);
		var end = delay(40, streamOf(sentinel));

		return drain(timeslice.takeUntil(end, s)).then(function(x) {
			expect(x).toBe(sentinel);
		});
	});

});

describe('skipUntil', function() {
	it('should only contain events at or later than signal', function() {
		var stream = take(10, periodic(10));
		var signal = delay(25, streamOf());

		return reduce(function(count) {
			return count + 1;
		}, 0, timeslice.skipUntil(signal, stream))
			.then(function(count) {
				expect(count).toBe(7);
			});
	});

	it('should dispose signal', function() {
		var dispose = this.spy();
		var stream = take(10, periodic(10));
		var signal = new Stream(FakeDisposeSource.from(dispose, delay(25, streamOf())));

		return reduce(function(count) {
			return count + 1;
		}, 0, timeslice.skipUntil(signal, stream))
			.then(function(count) {
				expect(count).toBe(7);
				expect(dispose).toHaveBeenCalledOnce();
			});

	});

	it('should preserve end value', function() {
		var s = take(3, periodic(10, sentinel));
		var start = delay(30, streamOf());

		return drain(timeslice.skipUntil(start, s)).then(function(x) {
			expect(x).toBe(sentinel);
		});
	});

	it('should allow end before start signal', function() {
		var s = take(3, periodic(10));
		var start = delay(30, streamOf());
		var end = delay(10, streamOf(sentinel));

		return drain(timeslice.skipUntil(start, timeslice.takeUntil(end, s))).then(function(x) {
			expect(x).toBe(sentinel);
		});
	});
});