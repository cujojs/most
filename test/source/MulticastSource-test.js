require('buster').spec.expose();
var expect = require('buster').expect;

var MulticastSource = require('../../lib/source/MulticastSource');
var iterable = require('../../lib/iterable');
var promise = require('../../lib/promises');
var resolve = promise.Promise.all;
var all = promise.Promise.all;

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

describe('MulticastSource', function() {

	it('should use the supplied scheduler', function() {
		var scheduler = {};
		var s = new MulticastSource(scheduler, function(){});
		expect(s.scheduler).toBe(scheduler);
	});

	it('should pass buffer policy through', function() {
		var spy = this.spy(function(x, array) {
			return array;
		});

		var s = new MulticastSource(Date, function(add) {
			add();
		}, spy);

		iterable.getIterator(s).next();
		expect(spy).toHaveBeenCalled();
	});

	it('should call producer on first subscriber', function() {
		var spy = this.spy();
		var s = new MulticastSource(Date, spy);

		iterable.getIterator(s);
		expect(spy).toHaveBeenCalledOnce();
	});

	it('should call producer ONLY on first subscriber', function() {
		var spy = this.spy();
		var s = new MulticastSource(Date, spy);

		iterable.getIterator(s);
		iterable.getIterator(s);
		expect(spy).toHaveBeenCalledOnce();
	});

	it('should publish events to all subscribers', function() {
		var s = new MulticastSource(Date, function(add) {
			setTimeout(function() {
				add(sentinel);
			}, 0);
		});

		var i1 = iterable.getIterator(s);
		var i2 = iterable.getIterator(s);

		return all([i1.next(), i2.next()]).then(function(events) {
			expect(events[0].value).toBe(sentinel);
			expect(events[1].value).toBe(sentinel);
		});
	});

	it('should call dispose on end', function() {
		var spy = this.spy();
		var s = new MulticastSource(Date, function(add, end) {
			end();
			return spy;
		});

		var i = resolve(iterable.getIterator(s).next());

		return i.then(function() {
			expect(spy).toHaveBeenCalled();
		});
	});

	it('should call dispose if all subscribers disconnect', function() {
		var spy = this.spy();
		var s = new MulticastSource(Date, function() {
			return spy;
		});

		var end1 = iterable.getIterator(s).queue.end();
		var end2 = iterable.getIterator(s).queue.end();

		return all([end1, end2]).then(function() {
			expect(spy).toHaveBeenCalledOnce();
		});
	});
});