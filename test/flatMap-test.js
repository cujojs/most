require('buster').spec.expose();
var expect = require('buster').expect;
var assertSame = require('./helper/stream-helper').assertSame;

var flatMap = require('../lib/combinator/flatMap');
var delay = require('../lib/combinator/delay').delay;
var concat = require('../lib/combinator/build').concat;
var take = require('../lib/combinator/slice').take;
var drain = require('../lib/combinator/observe').drain;
var core = require('../lib/source/core');
var fromArray = require('../lib/source/fromArray').fromArray;
var Stream = require('../lib/Stream');

var te = require('./helper/testEnv');
var FakeDisposeSource = require('./helper/FakeDisposeSource');

var streamOf = core.of;
var never = core.never;

var sentinel = { value: 'sentinel' };

describe('flatMap', function() {

	it('should satisfy associativity', function() {
		// m.flatMap(f).flatMap(g) ~= m.flatMap(function(x) { return f(x).flatMap(g); })
		function f(x) { return streamOf(x + 'f'); }
		function g(x) { return streamOf(x + 'g'); }

		var m = streamOf('m');

		return assertSame(
			flatMap.flatMap(function(x) { return flatMap.flatMap(g, f(x)); }, m),
			flatMap.flatMap(g, flatMap.flatMap(f, m))
		);
	});

	it('should preserve time order', function() {
		var s = flatMap.flatMap(function(x) {
			return delay(x, streamOf(x));
		}, fromArray([2, 1]));

		return te.collectEvents(s, te.ticks(3))
			.then(function(events) {
				expect(events.length).toBe(2);

				expect(events[0].time).toBe(1);
				expect(events[0].value).toBe(1);

				expect(events[1].time).toBe(2);
				expect(events[1].value).toBe(2);
			});
	});
});

describe('join', function() {
	it('should merge items from all inner streams', function() {
		var a = [1,2,3];
		var b = [4,5,6];
		var streamsToMerge = fromArray([delay(1, fromArray(a)), fromArray(b)]);

		var s = flatMap.join(streamsToMerge);

		return te.collectEvents(s, te.ticks(2))
			.then(function(events) {
				var result = events.map(function(event) {
					return event.value;
				});
				// Include all items
				expect(result.sort()).toEqual(a.concat(b).sort());

				// Relative order of items in each stream must be preserved
				expect(result.indexOf(1) < result.indexOf(2)).toBeTrue();
				expect(result.indexOf(2) < result.indexOf(3)).toBeTrue();
				expect(result.indexOf(4) < result.indexOf(5)).toBeTrue();
				expect(result.indexOf(5) < result.indexOf(6)).toBeTrue();
			});
	});

	it('should dispose outer stream', function() {
		var dispose = this.spy();
		var inner = streamOf(sentinel);
		var outer = streamOf(inner);

		var s = flatMap.join(new Stream(new FakeDisposeSource(dispose, outer.source)));

		return drain(s).then(function() {
			expect(dispose).toHaveBeenCalled();
		});
	});

	it('should dispose inner stream', function() {
		var dispose = this.spy();
		var inner = new Stream(new FakeDisposeSource(dispose, streamOf(sentinel).source));

		var s = flatMap.join(streamOf(inner));

		return drain(s).then(function() {
			expect(dispose).toHaveBeenCalled();
		});
	});

	it('should dispose inner stream immediately', function() {
		var s = streamOf(concat(streamOf(1), never()));

		return drain(take(1, flatMap.join(s))).then(function() {
			expect(true).toBe(true);
		});
	});

	it('should dispose all inner streams', function() {

		var values = [1,2,3];
		var spies = values.map(function() {
			return this.spy();
		}, this);

		var inners = values.map(function(x, i) {
			return new Stream(new FakeDisposeSource(spies[i], streamOf(x).source));
		});

		var s = flatMap.join(fromArray(inners));

		return drain(s).then(function() {
			spies.forEach(function(spy) {
				expect(spy).toHaveBeenCalledOnce();
			});
		});
	});
});
