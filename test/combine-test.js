require('buster').spec.expose();
var expect = require('buster').expect;

var combine = require('../lib/combinator/combine');
var map = require('../lib/combinator/transform').map;
var take = require('../lib/combinator/slice').take;
var delay = require('../lib/combinator/delay').delay;
var observe = require('../lib/combinator/observe').observe;
var periodic = require('../lib/source/periodic').periodic;
var streamOf = require('../lib/source/core').of;
var Stream = require('../lib/Stream');

var te = require('./helper/testEnv');

var sentinel = { value: 'sentinel' };

describe('combine', function() {
	it('should yield initial only after all inputs yield', function() {
		var s1 = streamOf(1);
		var s2 = streamOf(sentinel);

		var sc = combine.combine(Array, s1, delay(1, s2));

		return te.collectEvents(sc, te.ticks(2)).then(function(events) {
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

		var sc = combine.combine(Array, take(a1.length, s1), take(a2.length, s2));

		return te.collectEvents(sc, te.ticks(a1.length+a2.length))
			.then(function(events) {
				expect(events).toEqual([
					{ time: 1, value: [ 0, 'a' ] },
					{ time: 2, value: [ 1, 'a' ] },
					{ time: 3, value: [ 1, 'b' ] },
					{ time: 4, value: [ 2, 'b' ] },
					{ time: 5, value: [ 2, 'c' ] },
					{ time: 6, value: [ 3, 'c' ] },
					{ time: 7, value: [ 3, 'd' ] }
				]);
			});
	});
});

describe('combineArray', function() {
	it('should yield initial only after all inputs yield', function() {
		var s1 = streamOf(1);
		var s2 = streamOf(sentinel);

		var sc = combine.combineArray(Array, [s1, delay(1, s2)]);

		return te.collectEvents(sc, te.ticks(2)).then(function(events) {
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

		var sc = combine.combineArray(Array, [take(a1.length, s1), take(a2.length, s2)]);

		return te.collectEvents(sc, te.ticks(a1.length+a2.length))
			.then(function(events) {
				expect(events).toEqual([
					{ time: 1, value: [ 0, 'a' ] },
					{ time: 2, value: [ 1, 'a' ] },
					{ time: 3, value: [ 1, 'b' ] },
					{ time: 4, value: [ 2, 'b' ] },
					{ time: 5, value: [ 2, 'c' ] },
					{ time: 6, value: [ 3, 'c' ] },
					{ time: 7, value: [ 3, 'd' ] }
				]);
			});
	});
});
