require('buster').spec.expose();
var expect = require('buster').expect;

var await = require('../lib/combinators/await').await;
var delay = require('../lib/combinators/timed').delay;
var observe = require('../lib/combinators/observe').observe;
var reduce = require('../lib/combinators/reduce').reduce;
var Stream = require('../lib/Stream');
var promise = require('../lib/promises');
var resolve = promise.Promise.resolve;
var delayedPromise = promise.delay;

var streamHelper = require('./helper/stream-helper');
var createTestScheduler = streamHelper.createTestScheduler;

var sentinel = { value: 'sentinel' };

function identity(x) {
	return x;
}

describe('await', function() {

	it('should await promises', function() {
		var s = await(Stream.of(resolve(sentinel)));

		return observe(function(x) {
			expect(x).toBe(sentinel);
		}, s);
	});

	it('should preserve event order', function() {
		var scheduler = createTestScheduler();
		var slow = delayedPromise(10, 1, scheduler);
		var fast = resolve(sentinel);

		// delayed promise followed by already fulfilled promise
		var s = await(Stream.from([slow, fast]));

		var result = reduce(function(a, x) {
			return a.concat(x);
		}, [], s).then(function(a) {
			expect(a).toEqual([1, sentinel]);
		});

		scheduler.tick(10, 1);
		return result;
	});

});
