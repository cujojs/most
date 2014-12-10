require('buster').spec.expose();
var expect = require('buster').expect;

var periodic = require('../../lib/source/periodic').periodic;
var filter = require('../../lib/combinator/filter');
var reduce = require('../../lib/combinator/accumulate').reduce;
var flatMap = require('../../lib/combinator/join').flatMap;
var Stream = require('../../lib/Stream');

var take = filter.take;

var sentinel = { value: 'sentinel' };

describe('//periodic', function() {
	it('should emit events at tick periods', function() {
		var scheduler = createTestScheduler();

		var count = 5;
		var result = reduce(function(c) {
			return c - 1;
		}, count, filter.take(count, timed.periodicOn(scheduler, 1)))
			.then(function(count) {
				expect(count).toBe(0);
			});

		scheduler.tick(10, 1);
		return result;
	});
});


