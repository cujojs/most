require('buster').spec.expose();
var expect = require('buster').expect;

var delay = require('../lib/combinator/delay').delay;
var streamOf = require('../lib/source/core').of;

var te = require('./helper/testEnv');

var sentinel = { value: 'sentinel' };

describe('delay', function() {
	it('should delay events by delayTime', function() {
		var dt = 1;
		var s = delay(dt, streamOf(sentinel));

		return te.collectEvents(s, te.ticks(dt+1)).then(function(events) {
			expect(events.length).toBe(1);
			expect(events[0].time).toBe(dt);
			expect(events[0].value).toBe(sentinel);
		});
	});
});
