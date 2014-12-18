var most = require('../../most');
var rx = require('rx');
var bacon = require('baconjs');
var kefir = require('kefir');
var lodash = require('lodash');
var highland = require('highland');
var Promise = require('when/lib/Promise');

var runner = require('./runner');

var kefirFromArray = runner.kefirFromArray;

// flatMapping n streams, each containing m items.
// Results in a single stream that merges in n x m items
// In Array parlance: Take an Array containing n Arrays, each of length m,
// and flatten it to an Array of length n x m.
var n = 1000, m = 1000;
var a = build(m, n);

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

function identity(x) {
	return x;
}

runner.run({
	most: runMost,
	lodash: runLodash,
	array: runArray,
	kefir: runKefir,
	highland: runHighland,
	rx: runRx,
	bacon: runBacon
}, 'flatMap ' + n + ' x ' + m, a).then(function() {
	console.log('DONE');
});

function runArray(a) {
	return flatMapArray(identity, a).reduce(sum, 0);
}

function flatMapArray(f, a) {
	return a.reduce(function(a, x) {
		return a.concat(f(x));
	}, []);
}

function runLodash(a) {
	return lodashFlatMap(identity, a).reduce(sum, 0);
}

function lodashFlatMap(f, a) {
	return lodash(a).map(f).flatten(true);
}

function runHighland(a) {
	return highland(a).flatMap(highland).reduce(0, sum);
}

function runMost(a) {
	return most.from(a).flatMap(most.from).reduce(sum, 0);
}

function runRx(a) {
	return rx.Observable.fromArray(a).flatMap(rx.Observable.fromArray).reduce(sum, 0);
}

function runBacon(a) {
	return bacon.fromArray(a).flatMap(bacon.fromArray).reduce(0, sum);
}

function runKefir(a) {
	return kefirFromArray(a).flatMap(kefirFromArray).reduce(sum, 0);
}

function sum(x, y) {
	return x + y;
}

function even(x) {
	return x % 2 === 0;
}
