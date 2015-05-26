require('buster').spec.expose();
var expect = require('buster').expect;

var periodic = require('../../lib/source/periodic').periodic;
var take = require('../../lib/combinator/slice').take;

var TestScheduler = require('../helper/TestScheduler');

var sentinel = { value: 'sentinel' };

describe('periodic', function() {
	it('should emit value at tick periods', function() {
		var n = 10;
		var s = take(n, periodic(1, sentinel));

		var scheduler = new TestScheduler();
		scheduler.tick(n);

		return scheduler.collect(s).then(function(events) {
			expect(events.length).toBe(n);
			expect(events.every(function(event, i) {
				return event.time === i;
			})).toBeTrue();
		});
	});
});


