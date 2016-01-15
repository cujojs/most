require('buster').spec.expose();
var expect = require('buster').expect;

var timestamp = require('../../lib/combinator/timestamp').timestamp;
var periodic = require('../../lib/source/periodic').periodic;
var take = require('../../lib/combinator/slice').take;

var te = require('../helper/testEnv');

var sentinel = { value: 'sentinel' };

describe('timestamp', function() {
	it('should emit time-value pairs', function() {
		var n = 10;
		var s = take(n, periodic(1, sentinel));

		return te.collectEvents(s, te.ticks(n)).then(function(events) {
			events.forEach(function(timeValue, i) {
				expect(timeValue.value).toBe(sentinel);
				expect(timeValue.time).toBe(i);
			});
		}, s);
	});
});
