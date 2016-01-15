require('buster').spec.expose();
var expect = require('buster').expect;

var periodic = require('../../lib/source/periodic').periodic;
var take = require('../../lib/combinator/slice').take;

var te = require('../helper/testEnv');

var sentinel = { value: 'sentinel' };

function hasTimeAndValue(event, i) {
	return event.time === i && event.value === sentinel;
}

describe('periodic', function() {
	it('should emit value at tick periods', function() {
		var n = 10;
		var s = take(n, periodic(1, sentinel));

		return te.collectEvents(s, te.ticks(n)).then(function(events) {
			expect(events.length).toBe(n);
			expect(events.every(hasTimeAndValue)).toBeTrue();
		});
	});
});


