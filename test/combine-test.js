require('buster').spec.expose();
var expect = require('buster').expect;

var combine = require('../lib/combinator/combine').combine;
var map = require('../lib/combinator/transform').map;
var take = require('../lib/combinator/slice').take;
var delay = require('../lib/combinator/delay').delay;
var observe = require('../lib/combinator/observe').observe;
var reduce = require('../lib/combinator/accumulate').reduce;
var periodic = require('../lib/source/periodic').periodic;
var streamOf = require('../lib/source/core').of;
var Stream = require('../lib/Stream');

var TestScheduler = require('./helper/TestScheduler');

var sentinel = { value: 'sentinel' };

describe('combine', function() {
	it('should yield initial only after all inputs yield', function() {
		var s1 = streamOf(1);
		var s2 = streamOf(sentinel);

		var sc = combine(Array, s1, delay(1, s2));

		var scheduler = new TestScheduler();
		scheduler.tick(1);

		return scheduler.collect(sc).then(function(events) {
			expect(events.length).toBe(1);
			expect(events[0].value).toEqual([1, sentinel]);
		});
	});

	it('should yield when any input stream yields', function() {
		var a1 = [0,1,2,3];
		var s1 = map(function() {
			return a1.shift();
		}, periodic(2));

		var a2 = ['a','b','c','d'];
		var s2 = delay(1, map(function() {
			return a2.shift();
		}, periodic(2)));

		var sc = combine(Array, take(a1.length, s1), take(a2.length, s2));

		var scheduler = new TestScheduler();
		scheduler.tick(a1.length+a2.length);

		return scheduler.collect(sc)
			.then(function(events) {
				var result = events.map(function(event) {
					return event.value;
				});

				expect(result).toEqual([
					[0,'a'],[1,'a'],[1,'b'], [2,'b'],[2,'c'],[3,'c'],[3,'d']
				]);
			});
	});
});