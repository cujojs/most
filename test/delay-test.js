require('buster').spec.expose();
var expect = require('buster').expect;

var delay = require('../lib/combinator/delay').delay;
var timestamp = require('../lib/combinator/timestamp').timestamp;
var tap = require('../lib/combinator/transform').tap;
var reduce = require('../lib/combinator/accumulate').reduce;
var streamOf = require('../lib/source/core').of;

var sentinel = { value: 'sentinel' };

describe('delay', function() {
	it('should delay events by delayTime', function() {
		var dt = 20;
		var original;

		var s = timestamp(delay(0, streamOf(sentinel)));

		var ds = delay(dt, tap(function(timeValue) {
			original = timeValue.time;
		}, s));

		return reduce(function(_, x) {
			return x;
		}, void 0, timestamp(ds)).then(function(timeValue) {
			expect(timeValue.time).not.toBeLessThan(original + dt);
		});
	});
});