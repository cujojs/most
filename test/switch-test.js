require('buster').spec.expose();
var expect = require('buster').expect;

var switchLatest = require('../lib/combinators/switch').switch;
var Stream = require('../lib/Stream');
var delayOn = require('../lib/combinators/timed').delayOn;

var createTestScheduler = require('./createTestScheduler');

function sequenceEqual(array, stream) {
	return stream.reduce(function(a, x) {
		return a.concat(x);
	}, [])
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
			var s = delayOn(scheduler, 2, Stream.from([
				delayOn(scheduler, 1, Stream.from([1,2,3])),
				delayOn(scheduler, 1, Stream.from([4,5,6])),
				delayOn(scheduler, 1, Stream.from([7,8,9]))
			]));

			var result = sequenceEqual([1,2,4,5,7,8,9], switchLatest(s));

			scheduler.tick(10, 1);
			return result;
		});
	});
});
