require('buster').spec.expose();
var expect = require('buster').expect;

var streamOf = require('../../lib/source/core').of;
var fromArray = require('../../lib/source/fromArray').fromArray;
var map = require('../../lib/combinator/transform').map;
var observe = require('../../lib/combinator/observe').observe;
var multicast = require('../../lib/combinator/multicast').multicast;
var all = require('../../lib/Promise').all;

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

describe('multicast', function() {

	it('two observers attached to mapping stream cause mapper function to be called twice', function() {
		var mapperSpy = this.spy();
		var observer1Spy = this.spy();
		var observer2Spy = this.spy();

		var s = streamOf(sentinel);
		var mapped = map(mapperSpy, s);

		var o1 = observe(observer1Spy, mapped);
		var o2 = observe(observer2Spy, mapped);

		return all([o1, o2]).then(function (a) {
			expect(mapperSpy).toHaveBeenCalledTwice();
			expect(observer1Spy).toHaveBeenCalledOnce();
			expect(observer2Spy).toHaveBeenCalledOnce();
		});
	});

	it('two observers attached to multicasted mapping stream cause mapper function to be called once', function() {
		var mapperSpy = this.spy();
		var observer1Spy = this.spy();
		var observer2Spy = this.spy();

		var s = streamOf(sentinel);
		var mapped = map(mapperSpy, s);
		var multicasted = multicast(mapped);

		var o1 = observe(observer1Spy, multicasted);
		var o2 = observe(observer2Spy, multicasted);

		return all([o1, o2]).then(function (a) {
			expect(mapperSpy).toHaveBeenCalledOnce();
			expect(observer1Spy).toHaveBeenCalledOnce();
			expect(observer2Spy).toHaveBeenCalledOnce();
		});
	});

	it('when multicasted and reduced twice, source streams are only evaluated once', function() {
		var sourceSpy = this.spy();
		var sumSpy = this.spy(function(sum, val) { return sum + val; });
		var prodSpy = this.spy(function(prod, val) { return prod * val; });

		var s = fromArray([1, 2, 3]).tap(sourceSpy);
		var multicasted = multicast(s);

		return multicasted.reduce(sumSpy, 0)
			.then(function (sum) {
				return multicasted.reduce(prodSpy, 1);
			})
			.then(function (prod) {
				expect(sourceSpy).toHaveBeenCalledThrice();
				expect(sumSpy).toHaveBeenCalledThrice();
				expect(prodSpy).toHaveBeenCalledThrice();
			});
	});
});
