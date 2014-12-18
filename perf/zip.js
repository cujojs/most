var most = require('../most');
var rx = require('rx');
var kefir = require('kefir');
var bacon = require('baconjs');
var lodash = require('lodash');
var highland = require('highland');
var Promise = require('when/lib/Promise');

var runner = require('./runner');

var kefirFromArray = runner.kefirFromArray;

// Create 2 streams, each with n items, zip them by summing the
// corresponding index pairs, then reduce the resulting stream by summing
var n = 100000;
var a = new Array(n);
var b = new Array(n);

for(var i = 0; i<n; ++i) {
	a[i] = i;
	b[i] = i;
}

runner.run({
	most: runMost,
	lodash: runLodash,
	kefir: runKefir,
	highland: runHighland,
	rx: runRx,
	bacon: runBacon
}, 'ready: ' + n + ' x 2', { a:a, b:b }).then(function() {
	console.log('DONE');
});

function runMost(arrays) {
	return most.from(arrays.a).zip(add, most.from(arrays.b)).reduce(add, 0);
}

function runLodash(arrays) {
	var pairs = lodash.zip(arrays.a, arrays.b);
	var added = lodash.map(pairs, addPair);
	return lodash.reduce(added, add, 0);
}

function addPair(pair) {
	return pair[0] + pair[1];
}

function runHighland(arrays) {
	return highland(arrays.a).zip(highland(arrays.b)).map(addPair).reduce(0, add);
}

function runRx(arrays) {
	return rx.Observable.fromArray(arrays.a).zip(rx.Observable.fromArray(arrays.b), add).reduce(add, 0);
}

function runBacon(arrays) {
	return bacon.zipWith(add, bacon.fromArray(arrays.a), bacon.fromArray(arrays.b)).reduce(0, add);
}

function runKefir(arrays) {
	return kefirFromArray(arrays.a).zip(kefirFromArray(arrays.b), add).reduce(add, 0);
}

function add(a, b) {
	return a + b;
}

function noop() {}

function inc(x) {
	return x+1;
}