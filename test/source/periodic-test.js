require('buster').spec.expose();
var expect = require('buster').expect;

var periodic = require('../../lib/source/periodic').periodic;
var take = require('../../lib/combinator/slice').take;
var reduce = require('../../lib/combinator/accumulate').reduce;
var scheduler = require('../../lib/Scheduler');

describe('periodic', function() {
	it('should emit events at tick periods', function() {
		var n = 10;
		var s = take(n, periodic(1));

		return reduce(function(t0, t1) {
			n -= 1;

			if(t0 >= 0) {
				expect(t1 - t0).toBe(1);
			}

			return t1;
		}, -1, s).then(function(t) {
			expect(scheduler.now()).not.toBeLessThan(t);
			expect(n).toBe(0);
		});
	});
});


