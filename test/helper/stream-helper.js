var expect = require('buster').expect;

var reduce = require('../../lib/combinator/accumulate').reduce;

exports.assertSame = assertSame;
exports.expectArray = expectArray;

function assertSame(s1, s2) {
	return Promise.all([toArray(s1), toArray(s2)]).then(arrayEquals);
}

function expectArray(array, s) {
	return toArray(s).then(function(result) {
		expect(result).toEqual(array);
	});
}

function toArray(s) {
	return reduce(function(a, x) {
		a.push(x);
		return a;
	}, [], s);
}

function arrayEquals(ss) {
	expect(ss[0]).toEqual(ss[1]);
}
