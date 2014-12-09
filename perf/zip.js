var most = require('../most');
var rx = require('rx');
var kefir = require('kefir');
var bacon = require('baconjs');
var lodash = require('lodash');
var Promise = require('when/lib/Promise');

rx.config.Promise = Promise; // ensure rx uses the same Promise

// Create 2 streams, each with n items, zip them by summing the
// corresponding index pairs, then reduce the resulting stream by summing
var n = 100000;
var a = new Array(n);
var b = new Array(n);

for(var i = 0; i<n; ++i) {
	a[i] = i;
	b[i] = i;
}

console.log('ready: ' + n + ' x 2');

//timeRx()
timeMost()
	.then(timeLodash)
	.then(timeKefir)
	.then(timeRx)
	.then(timeBacon);

function timeMost() {
	return runMost(a, b).then(function() {
		var start = Date.now();
		return runMost(a, b).then(function(z) {
			console.log('most', Date.now() - start, z);
		});
	});
}

function runMost(a, b) {
	return most.from(a).zip(add, most.from(b)).reduce(add, 0);
}

function timeLodash() {
	runLodash(a, b);
	var start = Date.now();
	var result = runLodash(a, b);
	console.log('lodash', Date.now() - start, result);
}

function runLodash(a, b) {
	var pairs = lodash.zip(a, b);
	var added = lodash.map(pairs, lodashAddPair);
	return lodash.reduce(added, add, 0);
}

function lodashAddPair(pair) {
	return pair[0] + pair[1];
}

function timeRx () {
	return new Promise(function (resolve, reject) {
		runRx(a, b).subscribe({
			onNext: noop,
			onError: reject,
			onCompleted: function () {
				var start = Date.now();
				var result;
				runRx(a, b).subscribe({
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

function runRx(a, b) {
	return rx.Observable.fromArray(a).zip(rx.Observable.fromArray(b), add).reduce(add, 0);
}

function timeBacon () {
	return new Promise(function (resolve, reject) {
		var s = runBacon(a, b);
		s.onError(reject);
		s.onValue(noop);
		s.onEnd(function () {
			var start = Date.now();
			var s = runBacon(a, b);
			var result;
			s.onError(reject);
			s.onValue(function(z) {
				result = z;
			});
			s.onEnd(function () {
				console.log('bacon', Date.now() - start, result);
				resolve();
			});
		});
	});
}

function runBacon(a, b) {
	return bacon.zipWith(add, bacon.fromArray(a), bacon.fromArray(b)).reduce(0, add);
}

function timeKefir() {
	return new Promise(function(resolve) {
		var k = runKefir(a, b);
		//k.onError(reject);
		k.onValue(noop);
		k.onEnd(function() {
			var start = Date.now();
			var k = runKefir(a, b);
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

function runKefir(a, b) {
	return kefirFromArray(a).zip(kefirFromArray(b), add).reduce(add, 0);
}

function kefirFromArray(array) {
	return kefir.fromBinder(function(emitter) {
		for(var i=0; i<array.length; ++i) {
			emitter.emit(array[i]);
		}
		emitter.end();
	});
}

function add(a, b) {
	return a + b;
}

function noop() {}

function inc(x) {
	return x+1;
}