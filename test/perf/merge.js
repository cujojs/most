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

// Merging n streams, each containing m items.
// Results in a single stream that merges in n x m items
// In Array parlance: Take an Array containing n Arrays, each of length m,
// and flatten it to an Array of length n x m.
var mn = runners.getIntArg2(100000, 10);
var a = build(mn[0], mn[1]);

function build(m, n) {
	var a = new Array(n);
	for(var i = 0; i< a.length; ++i) {
		a[i] = buildArray(i*1000, m);
	}
	return a;
}

function buildArray(base, n) {
	var a = new Array(n);
	for(var i = 0; i< a.length; ++i) {
		a[i] = base + i;
	}
	return a;
}

var suite = Benchmark.Suite('merge ' + mn[0] + ' x ' + mn[1] + ' streams');
var options = {
	defer: true,
	onError: function(e) {
		e.currentTarget.failure = e.error;
	}
};

suite
	.add('most', function(deferred) {
		var streams = a.map(most.from);
		runners.runMost(deferred, most.mergeArray(streams).reduce(sum, 0));
	}, options)
	.add('rx 4', function(deferred) {
		var streams = a.map(rx.Observable.fromArray);
		runners.runRx(deferred, rx.Observable.merge.apply(void 0, streams).reduce(sum, 0));
	}, options)
	.add('rx 5', function(deferred) {
		var streams = a.map(function(x) {return rxjs.Observable.fromArray(x)});
		runners.runRx5(deferred,
			rxjs.Observable.merge.apply(rxjs.Observable, streams).reduce(sum, 0))
	}, options)
	.add('kefir', function(deferred) {
		var streams = a.map(kefirFromArray);
		runners.runKefir(deferred, kefir.merge(streams).scan(sum, 0).last());
	}, options)
	.add('bacon', function(deferred) {
		var streams = a.map(bacon.fromArray);
		runners.runBacon(deferred, bacon.mergeAll(streams).reduce(0, sum));
	}, options)
	.add('highland', function(deferred) {
		// HELP WANTED: Is there a better way to do this in highland?
		// The two approaches below perform similarly
		var streams = a.map(highland);
		runners.runHighland(deferred, highland(streams).merge().reduce(0, sum));
		//runners.runHighland(deferred, highland(streams).flatMap(identity).reduce(0, sum));
	}, options)
	.add('lodash', function() {
		// "Merge" synchronous arrays by concatenation
		return lodash(a).flatten().reduce(sum, 0);
	})
	.add('Array', function() {
		// "Merge" synchronous arrays by concatenation
		return Array.prototype.concat.apply([], a).reduce(sum, 0);
	});

runners.runSuite(suite);

function sum(x, y) {
	return x + y;
}
