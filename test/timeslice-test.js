require('buster').spec.expose();
var expect = require('buster').expect;

var timeslice = require('../lib/combinator/timeslice');
var take = require('../lib/combinator/slice').take;
var periodic = require('../lib/source/periodic').periodic;
var core = require('../lib/source/core');
var streamOf = core.of;
var never = core.never;
var delay = require('../lib/combinator/delay').delay;
var reduce = require('../lib/combinator/accumulate').reduce;
var drain = require('../lib/combinator/observe').drain;
var Stream = require('../lib/Stream');

var FakeDisposeSource = require('./helper/FakeDisposeSource');

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

describe('timeslice', function() {
	it('should contain events at or later than min and earlier than max', function() {
		var stream = periodic(10);
		var min = delay(30, streamOf());
		var max = delay(80, streamOf());

		return reduce(function(count) {
			return count + 1;
		}, 0, timeslice.timeslice(min, max, stream))
			.then(function(count) {
				expect(count).toBe(5);
			});
	});

	it('should dispose source stream', function() {
		var dispose = this.spy();
		var stream = new Stream(FakeDisposeSource.from(dispose, periodic(10)));
		var min = delay(30, streamOf());
		var max = delay(80, streamOf());

		return reduce(function(count) {
			return count + 1;
		}, 0, timeslice.timeslice(min, max, stream))
			.then(function(count) {
				expect(count).toBe(5);
				expect(dispose).toHaveBeenCalledOnce();
			});

	});

	it('should dispose signals', function() {
		var disposeMin = this.spy();
		var disposeMax = this.spy();
		var stream = periodic(10);
		var min = new Stream(FakeDisposeSource.from(disposeMin, delay(30, streamOf())));
		var max = new Stream(FakeDisposeSource.from(disposeMax, delay(80, streamOf())));

		return reduce(function(count) {
			return count + 1;
		}, 0, timeslice.timeslice(min, max, stream))
			.then(function(count) {
				expect(count).toBe(5);
				expect(disposeMin).toHaveBeenCalledOnce();
				expect(disposeMax).toHaveBeenCalledOnce();
			});

	});
});

describe('takeUntil', function() {
	it('should only contain events earlier than signal', function() {
		var stream = periodic(10);
		var signal = delay(30, streamOf());

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

		return reduce(function(count) {
			return count + 1;
		}, 0, timeslice.takeUntil(signal, stream))
			.then(function(count) {
				expect(count).toBe(3);
				expect(dispose).toHaveBeenCalledOnce();
			});

	});

	it('should end immediately on signal', function() {
		var dispose = this.spy();
		var stream = new Stream(FakeDisposeSource.from(dispose, never()));
		var signal = streamOf();

		return drain(timeslice.takeUntil(signal, stream))
			.then(function(count) {
				expect(dispose).toHaveBeenCalledOnce();
			});

	});

	it('should dispose signal', function() {
		var dispose = this.spy();
		var stream = periodic(10);
		var signal = new Stream(FakeDisposeSource.from(dispose, delay(30, streamOf())));

		return reduce(function(count) {
			return count + 1;
		}, 0, timeslice.takeUntil(signal, stream))
			.then(function(count) {
				expect(count).toBe(3);
				expect(dispose).toHaveBeenCalledOnce();
			});

	});
});

describe('skipUntil', function() {
	it('should only contain events at or later than signal', function() {
		var stream = take(10, periodic(10));
		var signal = delay(30, streamOf());

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
		var signal = new Stream(FakeDisposeSource.from(dispose, delay(30, streamOf())));

		return reduce(function(count) {
			return count + 1;
		}, 0, timeslice.skipUntil(signal, stream))
			.then(function(count) {
				expect(count).toBe(7);
				expect(dispose).toHaveBeenCalledOnce();
			});

	});

});