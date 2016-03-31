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
var n = runners.getIntArg(10000);
var a = buildArray(n);

function buildArray(n) {
	var a = new Array(n);
	for(var i = 0; i< a.length; ++i) {
		a[i] = i;
	}
	return a;
}

function merge(n, create) {
	var s = create(a);
	for(var i=0; i<n; ++i) {
		s = s.merge(create(a))
	}
	return s;
}

function mergeHighland(n) {
	// HELP WANTED: Is there a better way to do this in highland?
	// The two approaches below perform similarly
	var s = highland(a);
	for(var i=0; i<n; ++i) {
		s = highland([s, highland(a)]).merge();
	}
	return s;
}

var suite = Benchmark.Suite('merge nested streams w/depth 2, 5, 10, 100 (' + n + ' items in each stream)');
var options = {
	defer: true,
	onError: function(e) {
		e.currentTarget.failure = e.error;
	}
};

suite
	.add('most (depth 2)', function(deferred) {
		var s = merge(2, most.from);
		runners.runMost(deferred, s.reduce(sum, 0));
	}, options)
	.add('most (depth 5)', function(deferred) {
		var s = merge(5, most.from);
		runners.runMost(deferred, s.reduce(sum, 0));
	}, options)
	.add('most (depth 10)', function(deferred) {
		var s = merge(10, most.from);
		runners.runMost(deferred, s.reduce(sum, 0));
	}, options)
	.add('most (depth 100)', function(deferred) {
		var s = merge(100, most.from);
		runners.runMost(deferred, s.reduce(sum, 0));
	}, options)
	// .add('most (depth 1000)', function(deferred) {
	// 	var s = merge(1000, most.from);
	// 	runners.runMost(deferred, s.reduce(sum, 0));
	// }, options)
	// .add('most (depth 10000)', function(deferred) {
	// 	var s = merge(10000, most.from);
	// 	runners.runMost(deferred, s.reduce(sum, 0));
	// }, options)
	.add('rx 4 (depth 2)', function(deferred) {
		var s = merge(2, rx.Observable.fromArray);
		runners.runRx(deferred, s.reduce(sum, 0));
	}, options)
	.add('rx 4 (depth 5)', function(deferred) {
		var s = merge(5, rx.Observable.fromArray);
		runners.runRx(deferred, s.reduce(sum, 0));
	}, options)
	.add('rx 4 (depth 10)', function(deferred) {
		var s = merge(10, rx.Observable.fromArray);
		runners.runRx(deferred, s.reduce(sum, 0));
	}, options)
	.add('rx 4 (depth 100)', function(deferred) {
		var s = merge(100, rx.Observable.fromArray);
		runners.runRx(deferred, s.reduce(sum, 0));
	}, options)
	.add('rx 5 (depth 2)', function(deferred) {
		var s = merge(2, function(x) {return rxjs.Observable.fromArray(x)});
		runners.runRx5(deferred, s.reduce(sum, 0));
	}, options)
	.add('rx 5 (depth 5)', function(deferred) {
		var s = merge(5, function(x) {return rxjs.Observable.fromArray(x)});
		runners.runRx5(deferred, s.reduce(sum, 0));
	}, options)
	.add('rx 5 (depth 10)', function(deferred) {
		var s = merge(10, function(x) {return rxjs.Observable.fromArray(x)});
		runners.runRx5(deferred, s.reduce(sum, 0));
	}, options)
	.add('rx 5 (depth 100)', function(deferred) {
		var s = merge(100, function(x) {return rxjs.Observable.fromArray(x)});
		runners.runRx5(deferred, s.reduce(sum, 0));
	}, options)
	.add('kefir (depth 2)', function(deferred) {
		var s = merge(2, kefirFromArray)
		runners.runKefir(deferred, s.scan(sum, 0).last());
	}, options)
	.add('kefir (depth 5)', function(deferred) {
		var s = merge(5, kefirFromArray)
		runners.runKefir(deferred, s.scan(sum, 0).last());
	}, options)
	.add('kefir (depth 10)', function(deferred) {
		var s = merge(10, kefirFromArray)
		runners.runKefir(deferred, s.scan(sum, 0).last());
	}, options)
	.add('kefir (depth 100)', function(deferred) {
		var s = merge(100, kefirFromArray)
		runners.runKefir(deferred, s.scan(sum, 0).last());
	}, options)
	.add('bacon (depth 2)', function(deferred) {
		var s = merge(2, bacon.fromArray);
		runners.runBacon(deferred, s.reduce(0, sum));
	}, options)
	.add('bacon (depth 5)', function(deferred) {
		var s = merge(5, bacon.fromArray);
		runners.runBacon(deferred, s.reduce(0, sum));
	}, options)
	.add('bacon (depth 10)', function(deferred) {
		var s = merge(10, bacon.fromArray);
		runners.runBacon(deferred, s.reduce(0, sum));
	}, options)
	.add('bacon (depth 100)', function(deferred) {
		var s = merge(100, bacon.fromArray);
		runners.runBacon(deferred, s.reduce(0, sum));
	}, options)
	.add('highland (depth 2)', function(deferred) {
		var s = mergeHighland(2)
		runners.runHighland(deferred, s.reduce(0, sum));
	}, options)
	.add('highland (depth 5)', function(deferred) {
		var s = mergeHighland(2)
		runners.runHighland(deferred, s.reduce(0, sum));
	}, options)
	.add('highland (depth 10)', function(deferred) {
		var s = mergeHighland(10)
		runners.runHighland(deferred, s.reduce(0, sum));
	}, options)
	// WARNING: Never finishes at 10k items
	// .add('highland (depth 100)', function(deferred) {
	// 	var s = mergeHighland(100)
	// 	runners.runHighland(deferred, s.reduce(0, sum));
	// }, options)
	// .add('lodash', function() {
	// 	// "Merge" synchronous arrays by concatenation
	// 	return lodash(a).flatten().reduce(sum, 0);
	// })
	// .add('Array', function() {
	// 	// "Merge" synchronous arrays by concatenation
	// 	return Array.prototype.concat.apply([], a).reduce(sum, 0);
	// });

runners.runSuite(suite);

function sum(x, y) {
	return x + y;
}
