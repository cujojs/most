var most = require('../most');
var rx = require('rx');
var bacon = require('baconjs');
var kefir = require('kefir');
var lodash = require('lodash');
var highland = require('highland');
var Promise = require('when/lib/Promise');

rx.config.Promise = Promise; // ensure rx uses the same Promise

// Create a stream from an Array of n integers
// filter out odds, map remaining evens by adding 1, then reduce by summing
var n = 1000000;
var a = new Array(n);

for(var i = 0; i< a.length; ++i) {
	a[i] = i;
}

console.log('ready: ' + n);

timeMost()
	.then(timeLodash)
	.then(timeArray)
	.then(timeKefir)
	.then(timeHighland)
	.then(timeRx)
	.then(timeBacon);

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

function timeRx () {
	return new Promise(function (resolve, reject) {
		runRx(a).subscribe({
			onNext: noop,
			onError: reject,
			onCompleted: function () {
				var start = Date.now();
				var result;
				runRx(a).subscribe({
					onNext: function(z) {
						result = z;
					},
					onError: reject,
					onCompleted: function () {
						console.log('rx', Date.now() - start, result);
						resolve();
					}
				});
			}
		});
	});
}

function timeBacon () {
	return new Promise(function (resolve, reject) {
		var b = runBacon(a);
		b.onError(reject);
		b.onValue(noop);
		b.onEnd(function () {
			var start = Date.now();
			var b = runBacon(a);
			var result;
			b.onError(reject);
			b.onValue(function(z) {
				result = z;
			});
			b.onEnd(function () {
				console.log('bacon', Date.now() - start, result);
				resolve();
			});
		});
	});
}

function timeKefir() {
	return new Promise(function(resolve) {
		var k = runKefir(a);
		//k.onError(reject);
		k.onValue(noop);
		k.onEnd(function() {
			var start = Date.now();
			var k = runKefir(a);
			var result;
			//k.onError(reject);
			k.onValue(function(z) {
				result = z;
			});
			k.onEnd(function() {
				console.log('kefir', Date.now() - start, result);
				resolve();
			});
		});
	});
}

function kefirFromArray(array) {
	return kefir.fromBinder(function(emitter) {
		for(var i=0; i<array.length; ++i) {
			emitter.emit(array[i]);
		}
		emitter.end();
	});
}

function timeMost () {
	return runMost(a).then(function() {
		var start = Date.now();
		return runMost(a).then(function (z) {
			console.log('most', Date.now() - start, z);
		});
	});
}

function timeArray () {
	runArray(a);
	var start = Date.now();
	var z = runArray(a);
	console.log('Array', Date.now() - start, z);
}

function timeLodash() {
	runLodash(a);
	var start = Date.now();
	var z = runLodash(a);
	console.log('Lodash', Date.now() - start, z);
}

function timeHighland() {
	return new Promise(function(resolve, reject) {
		runHighland(a).pull(function(err) {
			if(err) {
				reject(err);
				return;
			}

			var start = Date.now();
			runHighland(a).pull(function(err, z) {
				if(err) {
					reject(err);
					return;
				}

				console.log('highland', Date.now() - start, z);
				resolve(z);
			});
		});
	});
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
