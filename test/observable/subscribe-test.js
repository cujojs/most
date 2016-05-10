require('buster').spec.expose();
var expect = require('buster').expect;

var subscribe = require('../../lib/observable/subscribe').subscribe;
var empty = require('../../lib/source/core').empty;

describe('subscribe', function() {
	it('should return { unsubscribe: () => void }', function() {
		var subscription = subscribe({}, empty());

		expect(subscription).toBeObject();
		expect(subscription).not.toBe(null);
		expect(subscription.unsubscribe).toBeFunction();

		return subscription.unsubscribe();
	});
});
