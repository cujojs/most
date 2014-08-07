require('buster').spec.expose();
var expect = require('buster').expect;

var observe = require('../lib/combinators/observe');
var Stream = require('../lib/Stream');

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

describe('observe', function() {

	it('should call callback and return a promise', function() {
		var spy = this.spy();

		return observe.observe(spy, Stream.of(sentinel))
			.then(function() {
				expect(spy).toHaveBeenCalledWith(sentinel);
			});
	});

	it('should end if consumer returns End', function() {
		var spy = this.spy(function() {
			return new Stream.End();
		});

		return observe.observe(spy, Stream.from([sentinel, other]))
			.then(function() {
				expect(spy).toHaveBeenCalledOnceWith(sentinel);
				expect(spy).not.toHaveBeenCalledWith(other);
			});
	});

});
