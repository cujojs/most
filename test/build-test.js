require('buster').spec.expose();
var expect = require('buster').expect;

var build = require('../lib/combinator/build');
var take = require('../lib/combinator/slice').take;
var observe = require('../lib/combinator/observe').observe;
var delay = require('../lib/combinator/delay').delay;
var drain = require('../lib/combinator/observe').drain;
var reduce = require('../lib/combinator/accumulate').reduce;
var fromArray = require('../lib/source/fromArray').fromArray;
var core = require('../lib/source/core');
var Stream = require('../lib/Stream');

var streamOf = core.of;
var empty = core.empty;

var te = require('./helper/testEnv');
var FakeDisposeSource = require('./helper/FakeDisposeSource');

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

describe('build', function() {

	describe('cycle', function() {

		it('should keep repeating', function() {
			var s = take(9, build.cycle(fromArray([1, 2, 3])));

			return reduce(function(result, x) {
				return result.concat(x);
			}, [], s).then(function(result) {
				expect(result).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3]);
			});
		});

		it('should end on error', function() {
			var s = build.cycle(fromArray([1, 2, 3]));
			return observe(function() { throw sentinel; }, s).catch(function(e) {
				expect(e).toBe(sentinel);
			});
		});

		it('should dispose', function() {
			var dispose = this.spy();
			var s = new Stream(new FakeDisposeSource(function() {
				dispose();
			}, streamOf(0).source));

			return drain(take(1, build.cycle(s))).then(function() {
				expect(dispose).toHaveBeenCalledOnce();
			});
		});
	});

	describe('startWith', function() {
		it('should return a stream containing item as head', function() {
			var s = build.cons(sentinel, empty());
			return observe(function(x) {
				expect(x).toBe(sentinel);
			}, s);
		});
	});

	describe('concat', function() {

		it('should return a stream containing items from both streams in correct order', function() {
			var dt = 1;
			var s1 = delay(dt, fromArray([1,2]));
			var s2 = fromArray([3,4]);

			return te.collectEvents(build.concat(s1, s2), te.ticks(dt+2))
				.then(function(events) {
					var values = events.map(function(event) {
						return event.value;
					});
					expect(values).toEqual([1,2,3,4]);
				});
		});

		it('should satisfy left identity', function() {
			var s = build.concat(streamOf(sentinel), empty());

			return reduce(function(count, x) {
				expect(x).toBe(sentinel);
				return count + 1;
			}, 0, s).then(function(count) {
				expect(count).toBe(1);
			});
		});

		it('should satisfy right identity', function() {
			var s = build.concat(empty(), streamOf(sentinel));

			return reduce(function(count, x) {
				expect(x).toBe(sentinel);
				return count + 1;
			}, 0, s).then(function(count) {
				expect(count).toBe(1);
			});
		});

	});
});
