require('buster').spec.expose();
var expect = require('buster').expect;

var iterate = require('../lib/source/iterate').iterate;
var take = require('../lib/combinator/slice').take;
var zip = require('../lib/combinator/zip').zip;
var delay = require('../lib/combinator/delay').delay;
var fromArray = require('../lib/source/fromArray').fromArray;

var te = require('./helper/testEnv');

describe('zip', function() {
	it('should invoke f for each tuple', function() {
		var a = [1,2,3];
		var b = [4,5,6];
		var s = zip(Array, delay(1, fromArray(a)), delay(0, fromArray(b)));

		return te.collectEvents(s, te.ticks(1))
			.then(function(events) {
				expect(events).toEqual([
					{ time: 1, value: [1,4] },
					{ time: 1, value: [2,5] },
					{ time: 1, value: [3,6] }
				]);
			});
	});

	it('should end when shortest stream ends', function() {
		var s = fromArray([1,2,3,4]);

		var a = take(2, s);
		var b = take(3, s);

		return te.collectEvents(zip(Array, a, b), te.ticks(2))
			.then(function(events) {
				expect(events.length).toBe(2);
			});
	});
});
