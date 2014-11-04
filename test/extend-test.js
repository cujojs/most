require('buster').spec.expose();
var expect = require('buster').expect;

var extend = require('../lib/combinators/extend');
var empty = require('../lib/combinators/monoid').empty;
var take = require('../lib/combinators/filter').take;
var drain = require('../lib/combinators/drain').drain;
var reduce = require('../lib/combinators/reduce').reduce;
var observe = require('../lib/combinators/observe').observe;
var Stream = require('../lib/Stream');

var sentinel = { value: 'sentinel' };

function identity(x) {
	return x;
}

describe('cycle', function() {

	it('should keep repeating', function() {
		var s = take(9, extend.cycle(Stream.from([1, 2, 3])));
		return reduce(function(result, x) {
				return result.concat(x);
			}, [], s).then(function(result) {
				expect(result).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3]);
			});
	});

	it('should end on error', function() {
		var s = extend.cycle(Stream.from([1, 2, 3]));
		return observe(function() { throw sentinel; }, s).catch(function(e) {
				expect(e).toBe(sentinel);
			});
	});

	it('should dispose', function() {
		var dispose = this.spy();
		var items = new Stream.Yield(0, 1, sentinel);

		var s = new Stream(identity, items, void 0, dispose);

		return drain(take(1, extend.cycle(s))).then(function() {
			expect(dispose).toHaveBeenCalledWith(0, 0, sentinel);
		});
	});
});

describe('startWith', function() {
	it('should return a stream containing item as head', function() {
		return extend.cons(sentinel, Stream.from([1,2,3]))
			.head()
			.then(function(x) {
				expect(x).toBe(sentinel);
			});
	});

	it('when empty, should return a stream containing item as head', function() {
		return extend.cons(sentinel, empty())
			.head()
			.then(function(x) {
				expect(x).toBe(sentinel);
			});
	});
});

