var Benchmark = require('benchmark');
var most = require('../../most');
var rx = require('rx');
var rxjs = require('@reactivex/rxjs')
var kefir = require('kefir');
var bacon = require('baconjs');
var lodash = require('lodash');
var highland = require('highland');

var runners = require('./runners');
var kefirFromArray = runners.kefirFromArray;

// Create a stream from an Array of n integers
// filter out odds, map remaining evens by adding 1, then reduce by summing
var n = runners.getIntArg(1000000);
var a = new Array(n);
for(var i = 0; i< a.length; ++i) {
	a[i] = i;
}

var suite = Benchmark.Suite('skip(n/4) -> take(n/2) ' + n + ' integers');
var options = {
	defer: true,
	onError: function(e) {
		e.currentTarget.failure = e.error;
	}
};

var s = n * 0.25;
var t = n * 0.5;

suite
	.add('most', function(deferred) {
		runners.runMost(deferred, most.from(a).skip(s).take(t).map(add1).reduce(sum, 0));
	}, options)
	.add('rx 4', function(deferred) {
		runners.runRx(deferred, rx.Observable.fromArray(a).skip(s).take(t).reduce(sum, 0));
	}, options)
	.add('rx 5', function(deferred) {
		runners.runRx5(deferred,
			rxjs.Observable.from(a).skip(s).take(t).reduce(sum, 0));
	}, options)
	.add('kefir', function(deferred) {
		runners.runKefir(deferred, kefirFromArray(a).skip(s).take(t).scan(sum, 0).last());
	}, options)
	.add('bacon', function(deferred) {
		runners.runBacon(deferred, bacon.fromArray(a).skip(s).take(t).reduce(0, sum));
	}, options)
	.add('highland', function(deferred) {
		runners.runHighland(deferred, highland(a).drop(s).take(t).reduce(0, sum));
	}, options)
	.add('lodash', function() {
		return lodash(a).slice(s).slice(0, t).reduce(sum, 0);
	})
	.add('Array', function() {
		return a.slice(s).slice(0, t).reduce(sum, 0);
	});

runners.runSuite(suite);

function add1(x) {
	return x + 1;
}

function even(x) {
	return x % 2 === 0;
}

function sum(x, y) {
	return x + y;
}
