require('buster').spec.expose();
var expect = require('buster').expect;

var iterate = require('../lib/combinator/build').iterate;
var take = require('../lib/combinator/slice').take;
var zip = require('../lib/combinator/zip').zip;
var delay = require('../lib/combinator/delay').delay;
var reduce = require('../lib/combinator/accumulate').reduce;
var fromArray = require('../lib/source/fromArray').fromArray;

describe('zip', function() {
	it('should invoke f for each tuple', function() {
		var spy = this.spy();
		var a = [1,2,3];
		var b = [4,5,6];
		var s = zip(spy, delay(0, fromArray(a)), delay(0, fromArray(b)));

		return reduce(function(i) {
				expect(spy).toHaveBeenCalledWith(a[i], b[i]);
				return i + 1;
			}, 0, s);
	});

	it('should end when shortest stream ends', function() {
		var spy = function(a, b) {
			return a+b;
		};

		var a = take(2, iterate(inc, 1));
		var b = take(3, iterate(inc, 4));

		var s = zip(spy, a, b);

		return reduce(inc, 0, s).then(function(count) {
			expect(count).toBe(2);
		});
	});
});

function inc(x) {
	return x+1;
}