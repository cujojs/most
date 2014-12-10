var expect = require('buster').expect;

var observe = require('../../lib/combinator/observe').observe;
var Promise = require('../../lib/Promise');

exports.assertSame = assertSame;

function assertSame(p1, p2) {
	return new Promise(function(resolve, reject) {
		observe(function(x) {
			observe(function(y) {
				expect(x).toBe(y);
				resolve();
			}, p2).catch(reject);
		}, p1);
	});
}
