require('buster').spec.expose();
var expect = require('buster').expect;

var combine = require('../lib/combinators/combine');
var timed = require('../lib/combinators/timed');
var observe = require('../lib/combinators/observe').observe;
var reduce = require('../lib/combinators/reduce').reduce;
var Stream = require('../lib/Stream');

var step = require('../lib/step');
var Yield = step.Yield;
var End = step.End;

var createTestScheduler = require('./createTestScheduler');

function identity(x) {
	return x;
}

function createStream(scheduler, times) {
	var iterations = times.slice(0, times.length-1).reduceRight(function(s, t) {
		return new Yield(t, t, s);
	}, new End(times[times.length-1]));

	return new Stream(identity, iterations, scheduler);
}

describe('combineWith', function() {
	it('should yield initial only after all inputs yield', function() {
		var scheduler = createTestScheduler();

		var s1 = createStream(scheduler, [1,3]);
		var s2 = createStream(scheduler, [2,3]);

		var sc = combine.combineWith(Array, timed.delay(1,s1), timed.delay(1, s2));

		var result = observe(function(x) {
			expect(x).toEqual([1,2]);
		}, sc);

		scheduler.tick(3);
		return result;
	});

	it('should yield when any input stream yields', function() {
		var scheduler = createTestScheduler();

		var s1 = createStream(scheduler, [0,2,4,6]);
		var s2 = createStream(scheduler, [1,3,5,6]);

		var sc = combine.combineWith(Array, timed.delay(1,s1), timed.delay(1,s2));

		var result = reduce(function(array, x) {
			array.push(x);
			return array;
		}, [], sc)
			.then(function(result) {
				expect(result).toEqual([
					[0,1],
					[2,1],
					[2,3],
					[4,3],
					[4,5]
				]);
			});

		scheduler.tick(10);
		return result;

	});
});