require('buster').spec.expose();
var expect = require('buster').expect;

var zip = require('../lib/combinators/zip').zip;
var reduce = require('../lib/combinators/reduce').reduce;
var Stream = require('../lib/Stream');

describe('zip', function() {
	it('should invoke f for each tuple', function() {
		var spy = this.spy();
		var a = [1,2,3];
		var b = [4,5,6];
		var s = zip(spy, Stream.from(a), Stream.from(b));

		return reduce(function(i) {
				expect(spy).toHaveBeenCalledWith(a[i], b[i]);
				return i + 1;
			}, 0, s);
	});

	it('should end when shortest stream ends', function() {
		var spy = this.spy();
		var a = [1,2];
		var b = [4,5,6];
		var s = zip(spy, Stream.from(a), Stream.from(b));

		return reduce(function(count) {
				return count + 1;
			}, 0, s).then(function(count) {
				expect(count).toBe(a.length);
			});
	});
});
