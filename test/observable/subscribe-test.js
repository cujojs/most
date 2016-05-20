require('buster').spec.expose();
var assert = require('buster').referee.assert;
var refute = require('buster').referee.refute;
var fail = require('buster').referee.fail;

var empty = require('../../lib/source/core').empty;
var dispose = require('../../lib/disposable/dispose');
var s = require('../../lib/observable/subscribe');
var subscribe = s.subscribe;
var SubscribeObserver = s.SubscribeObserver;
var Subscription = s.Subscription;

describe('subscribe', function() {
	it('should return { unsubscribe: () => void }', function() {
		var subscription = subscribe({}, empty());

		refute.same(null, subscription);
		assert.isObject(subscription);
		assert.isFunction(subscription.unsubscribe);

		assert.same(undefined, subscription.unsubscribe());
	});

	it('should throw TypeError if subscriber not an object', function() {
		assert.exception(function() {
			subscribe(null, empty())
		}, function(e) { return e instanceof TypeError });
	});
});

describe('Subscription', function() {
	describe('unsubscribe', function() {
		it('should call disposable.dispose and return undefined', function() {
			var disposable = { dispose: this.spy(function() { return {}; }) };
			var s = new Subscription(disposable);
			var result = s.unsubscribe();

			assert.calledOnce(disposable.dispose);
			assert.same(undefined, result);
		})
	})
})

describe('SubscribeObserver', function() {
	describe('event', function() {
		it('should be noop when subscriber.next not present', function() {
			var so = new SubscribeObserver(fail, {}, dispose.empty());
			assert.same(undefined, so.event(1, 1));
		});

		it('should be noop when subscriber.next not function', function() {
			var so = new SubscribeObserver(fail, { next: 123 }, dispose.empty());
			assert.same(undefined, so.event(1, 1));
		});

		it('should call subscriber.next if present', function() {
			var events = [];
			var subscriber = {
				next: function(x) {
					events.push(x);
				}
			};

			var so = new SubscribeObserver(fail, subscriber, dispose.empty());
			so.event(1, 1);
			so.event(2, 2);
			so.event(3, 3);

			assert.equals([1, 2, 3], events);
		});
	});

	describe('end', function() {
		it('should eventually call subscriber.complete if present', function() {
			return new Promise(function(resolve) {
				var subscriber = { complete: resolve };
				var so = new SubscribeObserver(fail, subscriber, dispose.empty());
				so.end(0, 1)
			}).then(function(x) {
				assert.same(1, x);
			});
		});

		it('when dispose fails, should eventually call subscriber.error if present', function() {
			var error = new Error();
			return new Promise(function(resolve) {
				var subscriber = { error: resolve };
				var disposable = { dispose: function() { return Promise.reject(error); } }
				var so = new SubscribeObserver(fail, subscriber, disposable);
				so.end(0, 1)
			}).then(function(e) {
				assert.same(error, e);
			});
		});

		it('when complete fails, should eventually call subscriber.error if present', function() {
			var error = new Error();
			return new Promise(function(resolve) {
				var subscriber = {
					complete: function() { throw error; },
					error: resolve
				};
				var so = new SubscribeObserver(fail, subscriber, dispose.empty());
				so.end(0, 1)
			}).then(function(e) {
				assert.same(error, e);
			});
		});
	});

	describe('error', function() {
		it('should eventually call subscriber.error if present', function() {
			var error = new Error();
			return new Promise(function(resolve) {
				var subscriber = { error: resolve };
				var so = new SubscribeObserver(fail, subscriber, dispose.empty());
				so.error(0, error)
			}).then(function(e) {
				assert.same(error, e);
			});
		});

		it('when error fails, should call fatalError', function() {
			var error = new Error();

			return new Promise(function(resolve) {
				var subscriber = {
					error: function() { throw error; }
				}

				var so = new SubscribeObserver(resolve, subscriber, dispose.empty());
				so.error(0, new Error())
			}).then(function(e) {
				assert.same(error, e);
			});
		})
	});
});
