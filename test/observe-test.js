require('buster').spec.expose();
var expect = require('buster').expect;

var observe = require('../lib/combinators/observe');
var Stream = require('../lib/Stream');
var makeStreamFromTimes = require('./helper/stream-helper').makeStreamFromTimes;

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

function identity(x) {
	return x;
}

describe('observe', function() {

	it('should call callback and return a promise', function() {
		var spy = this.spy();

		return observe.observe(spy, Stream.of(sentinel))
			.then(function() {
				expect(spy).toHaveBeenCalledWith(sentinel);
			});
	});

	it('should return a promise for the end signal value', function() {
		var s = new Stream(identity, new Stream.End(0, sentinel));
		return observe.observe(function() {}, s)
			.then(function(x) {
				expect(x).toBe(sentinel);
			});
	});

	it('should call callback with expected values until end', function() {

		var values = [0,1,2,3,4];
		var s = makeStreamFromTimes(values, 5);

		var spy = this.spy(function(x) {
			expect(x).toBe(values.shift());
		});

		return observe.observe(spy, s)
			.then(function() {
				expect(values.length).toBe(0);
			});
	});

});
