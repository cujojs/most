require('buster').spec.expose();
var expect = require('buster').expect;

var delay = require('../lib/combinator/delay').delay;
var streamOf = require('../lib/source/core').of;

var TestScheduler = require('./helper/TestScheduler');

var sentinel = { value: 'sentinel' };

describe('delay', function() {
	it('should delay events by delayTime', function() {
		var dt = 1;

		var scheduler = new TestScheduler();

		var s = delay(dt, streamOf(sentinel));

		scheduler.tick(dt);

		return scheduler.collect(s).then(function(events) {
			expect(events.length).toBe(1);
			expect(events[0].time).toBe(dt);
		});
	});
});