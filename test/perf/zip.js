var Benchmark = require('benchmark');
var most = require('../../most');
var rx = require('rx');
var rxjs = require('@reactivex/rxjs');
var kefir = require('kefir');
var bacon = require('baconjs');
var lodash = require('lodash');
var highland = require('highland');

var runners = require('./runners');
var kefirFromArray = runners.kefirFromArray;

// Create 2 streams, each with n items, zip them by summing the
// corresponding index pairs, then reduce the resulting stream by summing
var n = runners.getIntArg(100000);
var a = new Array(n);
var b = new Array(n);

for(var i = 0; i<n; ++i) {
	a[i] = i;
	b[i] = i;
}

var suite = Benchmark.Suite('zip 2 x ' + n + ' integers');
var options = {
	defer: true,
	onError: function(e) {
		e.currentTarget.failure = e.error;
	}
};

suite
	.add('most', function(deferred) {
		runners.runMost(deferred, most.from(a).zip(add, most.from(b)).reduce(add, 0));
	}, options)
	.add('rx 4', function(deferred) {
		runners.runRx(deferred, rx.Observable.fromArray(a).zip(rx.Observable.fromArray(b), add).reduce(add, 0));
	}, options)
	.add('rx 5', function(deferred) {
		runners.runRx5(deferred, rxjs.Observable.fromArray(a).zip(rxjs.Observable.fromArray(b), add).reduce(add, 0));
	}, options)
	.add('kefir', function(deferred) {
		runners.runKefir(deferred, kefirFromArray(a).zip(kefirFromArray(b), add).scan(add, 0).last());
	}, options)
	.add('bacon', function(deferred) {
		runners.runBacon(deferred, bacon.zipWith(add, bacon.fromArray(a), bacon.fromArray(b)).reduce(0, add));
	}, options)
	.add('highland', function(deferred) {
		runners.runHighland(deferred, highland(a).zip(highland(b)).map(addPair).reduce(0, add));
	}, options)
	.add('lodash', function() {
		return lodash(a).zip(b).map(addPair).reduce(add, 0);
	});

runners.runSuite(suite);

function addPair(pair) {
	return pair[0] + pair[1];
}
function add(a, b) {
	return a + b;
}
