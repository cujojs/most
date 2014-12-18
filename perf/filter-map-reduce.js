var most = require('../most');
var rx = require('rx');
var bacon = require('baconjs');
var kefir = require('kefir');
var lodash = require('lodash');
var highland = require('highland');
var Promise = require('when/lib/Promise');

var runner = require('./runner');

var kefirFromArray = runner.kefirFromArray;

// Create a stream from an Array of n integers
// filter out odds, map remaining evens by adding 1, then reduce by summing
var n = 1000000;
var a = new Array(n);

for(var i = 0; i< a.length; ++i) {
	a[i] = i;
}

runner.run({
	most: runMost,
	lodash: runLodash,
	array: runArray,
	kefir: runKefir,
	highland: runHighland,
	rx: runRx,
	bacon: runBacon
}, 'filter -> map -> reduce ' + n + ' integers', a).then(function() {
	console.log('DONE');
});

function runArray(a) {
	return a.filter(even).map(add1).reduce(sum, 0);
}

function runLodash(a) {
	return lodash(a).filter(even).map(add1).reduce(sum, 0);
}

function runHighland(a) {
	return highland(a).filter(even).map(add1).reduce(0, sum);
}

function runMost(a) {
	return most.from(a).filter(even).map(add1).reduce(sum, 0);
}

function runRx(a) {
	return rx.Observable.fromArray(a).filter(even).map(add1).reduce(sum, 0);
}

function runBacon(a) {
	return bacon.fromArray(a).filter(even).map(add1).reduce(0, sum);
}

function runKefir(a) {
	return kefirFromArray(a).filter(even).map(add1).reduce(sum, 0);
}

function sum(x, y) {
	return x + y;
}

function add1(x) {
	return x + 1;
}

function even(x) {
	return x % 2 === 0;
}

function noop() {}
