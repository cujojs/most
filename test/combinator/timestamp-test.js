require('buster').spec.expose();
var expect = require('buster').expect;

var timestamp = require('../../lib/combinator/timestamp').timestamp;
var periodic = require('../../lib/source/periodic').periodic;
var take = require('../../lib/combinator/slice').take;
var observe = require('../../lib/combinator/observe').observe;
var streamOf = require('../../lib/source/core').of;

var sentinel = { value: 'sentinel' };

describe('timestamp', function() {
	it('should emit time-value pairs', function() {
		var s = take(10, timestamp(periodic(1)));

		return observe(function(timeValue) {
			expect(timeValue.value).toBe(timeValue.time);
		}, s);
	});
});