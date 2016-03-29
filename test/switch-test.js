require('buster').spec.expose();
var expect = require('buster').expect;

var switchLatest = require('../lib/combinator/switch').switch;
var reduce = require('../lib/combinator/accumulate').reduce;
var observe = require('../lib/combinator/observe').observe;
var take = require('../lib/combinator/slice').take;
var transform = require('../lib/combinator/transform');
var periodic = require('../lib/source/periodic').periodic;
var fromArray = require('../lib/source/fromArray').fromArray;
var core = require('../lib/source/core');
var Stream = require('../lib/Stream');

var te = require('./helper/testEnv');

var constant = transform.constant;
var map = transform.map;

describe('switch', function() {
	describe('when input is empty', function() {
		it('should return empty', function() {
			var spy = this.spy();
			return observe(spy, switchLatest(core.empty()))
				.then(function() {
					expect(spy).not.toHaveBeenCalled();
				});
		});
	});

	describe('when input contains a single stream', function() {
		it('should return an equivalent stream', function() {
			var expected = [1, 2, 3];
			var s = core.of(fromArray(expected));

			return te.collectEvents(switchLatest(s), te.ticks(1)).then(function(events) {
				expect(events).toEqual([
					{ time: 0, value: 1 },
					{ time: 0, value: 2 },
					{ time: 0, value: 3 }
				])
			})
		});
	});

	describe('when input contains many streams', function() {
		describe('and all items are instantaneous', function() {
			it('should be equivalent to the last inner stream', function() {
				var expected = [1, 2, 3];
				var s = fromArray([
					fromArray([4, 5, 6]),
					fromArray(expected)
				]);

				return te.collectEvents(switchLatest(s), te.ticks(1)).then(function(events) {
					expect(events).toEqual([
						{ time: 0, value: 1 },
						{ time: 0, value: 2 },
						{ time: 0, value: 3 }
					])
				})
			});
		});

		it('should switch when new stream arrives', function() {
			var i = 0;
			var s = map(function() {
				return constant(++i, periodic(1));
			}, periodic(3));

			return te.collectEvents(take(10, switchLatest(s)), te.ticks(250)).then(function(events) {
				expect(events).toEqual([
					{ time: 0, value: 1 },
					{ time: 1, value: 1 },
					{ time: 2, value: 1 },
					{ time: 3, value: 2 },
					{ time: 4, value: 2 },
					{ time: 5, value: 2 },
					{ time: 6, value: 3 },
					{ time: 7, value: 3 },
					{ time: 8, value: 3 },
					{ time: 9, value: 4 },
				]);
			});
		});
	});
});
