require('buster').spec.expose();
var assert = require('buster').referee.assert;

var reduce = require('../../lib/combinator/accumulate').reduce;
var fo = require('../../lib/observable/fromObservable');
var fromObservable = fo.fromObservable;
var ObservableSource = fo.ObservableSource;
var SubscriberSink = fo.SubscriberSink;

function simpleObservable(subscribe) {
	return { subscribe: subscribe };
}

describe('fromObservable', function() {
	it('should contain observable items', function() {
		var events = [1, 2, 3];
		var o = simpleObservable(function(observer) {
			events.forEach(function(x) {
				observer.next(x);
			});
			observer.complete();
			return function() {}
		});

		var s = fromObservable(o);
		return reduce(function(a, x) { return a.concat(x); }, [], s)
			.then(function(a) {
				assert.equals(events, a);
			});
	});
});

describe('ObservableSource', function() {
	it('when subscribe returns function, should return disposable', function() {
		var sentinel = {};
		var o = simpleObservable(function() {
			return function() { return sentinel; };
		});

		var os = new ObservableSource(o);
		var disposable = os.run({}, {});

		assert.same(sentinel, disposable.dispose());
	});

	it('when subscribe returns object, should return disposable', function() {
		var sentinel = {};
		var o = simpleObservable(function() {
			return { unsubscribe: function() { return sentinel; } };
		});

		var os = new ObservableSource(o);
		var disposable = os.run({}, {});

		assert.same(sentinel, disposable.dispose());
	});

	it('when subscribe returns neither function nor object, should throw TypeError', function() {
		var sentinel = {};
		var o = simpleObservable(function() {
			return null;
		});

		var os = new ObservableSource(o);
		assert.exception(function() {
			os.run({}, {});
		});
	});
});

describe('SubscriberSink', function() {
	describe('next', function() {
		it('should call sink.event', function() {
			var sink = { event: this.spy() };
			var scheduler = { now: function() { return 1; } };
			var ss = new SubscriberSink(sink, scheduler);

			var x = {};
			ss.next(x);

			assert.calledOnceWith(sink.event, 1, x);
		});
	});

	describe('complete', function() {
		it('should call sink.end', function() {
			var sink = { end: this.spy() };
			var scheduler = { now: function() { return 1; } };
			var ss = new SubscriberSink(sink, scheduler);

			var x = {};
			ss.complete(x);

			assert.calledOnceWith(sink.end, 1, x);
		});
	});

	describe('error', function() {
		it('should call sink.error', function() {
			var sink = { error: this.spy() };
			var scheduler = { now: function() { return 1; } };
			var ss = new SubscriberSink(sink, scheduler);

			var x = {};
			ss.error(x);

			assert.calledOnceWith(sink.error, 1, x);
		});
	});
});
