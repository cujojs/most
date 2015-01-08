require('buster').spec.expose();
var expect = require('buster').expect;
var assertSame = require('../helper/stream-helper').assertSame;

var concatMap = require('../../lib/combinator/concatMap');
var delay = require('../../lib/combinator/delay').delay;
var concat = require('../../lib/combinator/build').concat;
var take = require('../../lib/combinator/slice').take;
var reduce = require('../../lib/combinator/accumulate').reduce;
var drain = require('../../lib/combinator/observe').drain;
var core = require('../../lib/source/core');
var fromArray = require('../../lib/source/fromArray').fromArray;
var Stream = require('../../lib/Stream');

var FakeDisposeSource = require('../helper/FakeDisposeSource');

var streamOf = core.of;
var never = core.never;

var sentinel = { value: 'sentinel' };

function identity(x) {
	return x;
}

describe('concatMap', function() {

	it('should satisfy associativity', function() {
		// m.concatMap(f).concatMap(g) ~= m.concatMap(function(x) { return f(x).concatMap(g); })
		function f(x) { return streamOf(x + 'f'); }
		function g(x) { return streamOf(x + 'g'); }

		var m = streamOf('m');

		return assertSame(
			concatMap.concatMap(function(x) { return concatMap.concatMap(g, f(x)); }, m),
			concatMap.concatMap(g, concatMap.concatMap(f, m))
		);
	});

	it('should concatenate', function() {
		var s = concatMap.concatMap(function(x) {
			return delay(x, streamOf(x));
		}, fromArray([20, 10]));

		return reduce(function(a, x) {
			return a.concat(x);
		}, [], s)
			.then(function(a) {
				expect(a).toEqual([20, 10]);
			});
	});

	it('should concatenate all inner streams', function() {
		var a = [1,2,3];
		var b = [4,5,6];
		var streamsToMerge = fromArray([delay(10, fromArray(a)), delay(0, fromArray(b))]);

		return reduce(function(result, x) {
			return result.concat(x);
		}, [], concatMap.concatMap(identity, streamsToMerge))
			.then(function(result) {
				expect(result).toEqual(a.concat(b));
			});
	});

	it('should dispose outer stream', function() {
		var dispose = this.spy();
		var inner = streamOf(sentinel);
		var outer = streamOf(inner);

		var s = concatMap.concatMap(identity, new Stream(new FakeDisposeSource(dispose, outer.source)));

		return drain(s).then(function() {
			expect(dispose).toHaveBeenCalled();
		});
	});

	it('should dispose inner stream', function() {
		var dispose = this.spy();
		var inner = new Stream(new FakeDisposeSource(dispose, streamOf(sentinel).source));

		var s = concatMap.concatMap(identity, streamOf(inner));

		return drain(s).then(function() {
			expect(dispose).toHaveBeenCalled();
		});
	});

	it('should dispose inner stream immediately', function() {
		var s = streamOf(concat(streamOf(1), never()));

		return drain(take(1, concatMap.concatMap(identity, s))).then(function() {
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

		var s = concatMap.concatMap(identity, fromArray(inners));

		return drain(s).then(function() {
			spies.forEach(function(spy) {
				expect(spy).toHaveBeenCalledOnce();
			});
		});
	});
});
