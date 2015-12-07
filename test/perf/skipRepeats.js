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

// Create a stream from an Array of n integers
// filter out odds, map remaining evens by adding 1, then reduce by summing
var n = runners.getIntArg(1000000);
var a = new Array(n);
for(var i = 0, j = 0; i< a.length; i+=2, ++j) {
	a[i] = a[i+1] = j;
}

var suite = Benchmark.Suite('skipRepeats -> reduce 2 x ' + n + ' integers');
var options = {
	defer: true,
	onError: function(e) {
		e.currentTarget.failure = e.error;
	}
};

suite
	.add('most', function(deferred) {
		runners.runMost(deferred, most.from(a).skipRepeats().reduce(sum, 0));
	}, options)
	.add('rx 4', function(deferred) {
		runners.runRx(deferred, rx.Observable.fromArray(a).distinctUntilChanged().reduce(sum, 0));
	}, options)
	.add('rx 5', function(deferred) {
		runners.runRx5(deferred, rxjs.Observable.fromArray(a).distinctUntilChanged().reduce(sum, 0));
	}, options)
	.add('kefir', function(deferred) {
		runners.runKefir(deferred, kefirFromArray(a).skipDuplicates().scan(sum, 0).last());
	}, options)
	.add('bacon', function(deferred) {
		runners.runBacon(deferred, bacon.fromArray(a).skipDuplicates().reduce(0, sum));
	}, options)
	.add('lodash', function() {
		return lodash(a).uniq(true).reduce(sum, 0);
	})
	.add('Array', function() {
		return arrayUniq(a).reduce(sum, 0);
	});

runners.runSuite(suite);

function arrayUniq(a) {
	var value;
	var init = true;
	return a.filter(function(x) {
		if(init || x !== value) {
			init = false;
			value = x;
			return true;
		}

		return false;
	});
}

function sum(x, y) {
	return x + y;
}
