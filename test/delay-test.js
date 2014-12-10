require('buster').spec.expose();
var expect = require('buster').expect;

var delay = require('../lib/combinator/delay').delay;
var reduce = require('../lib/combinator/accumulate').reduce;
var observe = require('../lib/combinator/observe').observe;
var fromArray = require('../lib/source/fromArray').fromArray;

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

describe('//delay', function() {
	it('should delay events by delayTime', function() {
		var scheduler = createTestScheduler();

		var dt = 100;

		var s = new Stream(identity, new Yield(0, sentinel, new End(0)), scheduler);
		s = timed.delay(dt, s);
		var result = s.step(s.state).then(function(iteration) {
			expect(iteration.value).toBe(sentinel);
			expect(iteration.time).toBe(dt);
			expect(scheduler.now()).toBe(dt);
		});

		scheduler.tick(100);
		return result;
	});
});