require('buster').spec.expose();
var expect = require('buster').expect;

var periodic = require('../../lib/source/periodic').periodic;
var take = require('../../lib/combinator/slice').take;
var timestamp = require('../../lib/combinator/timestamp').timestamp;
var reduce = require('../../lib/combinator/accumulate').reduce;
var scheduler = require('../../lib/scheduler/defaultScheduler');

var sentinel = { value: 'sentinel' };

describe('periodic', function() {
	it('should emit value at tick periods', function() {
		var n = 10;
		var s = take(n, timestamp(periodic(1, sentinel)));

		return reduce(function(t0, t1) {
			n -= 1;

			if(t0.time >= 0) {
				expect(t1.time - t0.time).toBe(1);
			}

			expect(t1.value).toBe(sentinel);

			return t1;
		}, { time: -1, value: sentinel }, s).then(function(t) {
			expect(scheduler.now()).not.toBeLessThan(t);
			expect(n).toBe(0);
		});
	});
});


