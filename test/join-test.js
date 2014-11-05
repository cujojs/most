require('buster').spec.expose();
var expect = require('buster').expect;

var join = require('../lib/combinators/join').join;
var delay = require('../lib/combinators/timed').delay;
var concat = require('../lib/combinators/monoid').concat;
var take = require('../lib/combinators/filter').take;
var reduce = require('../lib/combinators/reduce').reduce;
var drain = require('../lib/combinators/drain').drain;
var Stream = require('../lib/Stream');

var sentinel = { value: 'sentinel' };

function identity(x) {
	return x;
}

describe('join', function() {
	it('should merge items from all inner streams', function() {
		var a = [1,2,3];
		var b = [4,5,6];
		var streamsToMerge = Stream.from([delay(0, Stream.from(a)), delay(0, Stream.from(b))]);

		return reduce(function(result, x) {
			return result.concat(x);
		}, [], join(streamsToMerge))
				.then(function(result) {
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
		var inner = Stream.of(sentinel);
		var items = new Stream.Yield(0, inner, new Stream.End(1, sentinel, sentinel));
		var s = join(new Stream(identity, items, void 0, dispose));

		return drain(s).then(function() {
			expect(dispose).toHaveBeenCalled();
		});
	});

	it('should dispose inner stream', function() {
		var dispose = this.spy();
		var items = new Stream.Yield(0, sentinel, new Stream.End(1, sentinel, sentinel));
		var inner = new Stream(identity, items, void 0, dispose);

		var s = join(Stream.from([inner]));

		return drain(s).then(function() {
			expect(dispose).toHaveBeenCalled();
		});
	});

	it('should dispose inner stream immediately', function() {
		var s = Stream.of(concat(Stream.of(1), Stream.never()));

		return drain(take(1, join(s))).then(function() {
			expect(true).toBe(true);
		});
	});

	it('should dispose all inner streams', function() {
		var dispose = this.spy();
		var items = new Stream.Yield(0, sentinel, new Stream.End(1, sentinel, sentinel));
		var inner = new Stream(identity, items, void 0, dispose);

		var s = join(Stream.from([inner, inner]));

		return drain(s).then(function() {
			expect(dispose).toHaveBeenCalledTwice();
		});
	});
});
