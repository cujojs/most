require('buster').spec.expose();
var expect = require('buster').expect;

var drain = require('../lib/combinators/drain').drain;
var Stream = require('../lib/Stream');
var makeStepsFromTimes = require('./helper/stream-helper').makeStepsFromTimes;

var sentinel = { value: 'sentinel' };

function identity(x) {
	return x;
}

describe('observe', function() {

	it('should return a promise for the end signal value', function() {
		var s = new Stream(identity, new Stream.End(0, sentinel));
		return drain(s).then(function(x) {
			expect(x).toBe(sentinel);
		});
	});

	it('should drain all events', function() {

		var values = [0,1,2,3,4];
		var steps = makeStepsFromTimes(values, 5);

		var i = values.length+1; // +1 to account for End event
		var s = new Stream(function(x) {
			i--;
			return x;
		}, steps);

		return drain(s).then(function() {
			expect(i).toBe(0);
		});
	});

});
