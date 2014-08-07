require('buster').spec.expose();
var expect = require('buster').expect;

var switchLatest = require('../lib/combinators/switch').switch;
var Stream = require('../lib/Stream');
var reduce = require('../lib/combinators/reduce').reduce;
var sync = require('../lib/combinators/timed').sync;

var step = require('../lib/step');
var Yield = step.Yield;
var End = step.End;

var createTestScheduler = require('./createTestScheduler');

function identity(x) {
	return x;
}

function sequenceEqual(array, stream) {
	return reduce(function(a, x) {
		return a.concat(x);
	}, [], stream)
		.then(function(a) {
			expect(a).toEqual(array);
		});
}

describe('switch', function() {
	describe('when input is empty', function() {
		it('should return empty', function() {
			var spy = this.spy();
			return switchLatest(new Stream(function() {
				return new Stream.End();
			})).observe(spy)
				.then(function() {
					expect(spy).not.toHaveBeenCalled();
				});
		});
	});

	describe('when input contains a single stream', function() {
		it('should return an equivalent stream', function() {
			var expected = [1, 2, 3];
			var s = Stream.of(Stream.from(expected));

			return sequenceEqual(expected, switchLatest(s));
		});
	});

	describe('when input contains many streams', function() {
		describe('and all items are instantaneous', function() {
			it('should be equivalent to the last inner stream', function() {
				var expected = [1, 2, 3];
				var s = Stream.from([
					Stream.from([4, 5, 6]),
					Stream.from(expected)
				]);

				return sequenceEqual(expected, switchLatest(s));
			});
		});

		it('should switch when new stream arrives', function() {
			var scheduler = createTestScheduler();
			var times = [[0,1,3], [2,3,5], [4,5,6]];

			var steps = times.reduceRight(function(step, ts, i) {
				var innerSteps = ts.reduceRight(function(s, t) {
					return new Yield(t, i, s);
				}, new End(ts[ts.length-1] + 1));

				var s = sync(new Stream(identity, innerSteps, scheduler));
				return new Yield(ts[0], s, step);
			}, new End(7));

			var s = sync(new Stream(identity, steps, scheduler));

			var result = sequenceEqual([0,0,1,1,2,2,2], switchLatest(s));

			scheduler.tick(8, 1);
			return result;
		});
	});
});
