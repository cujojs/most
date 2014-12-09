var most = require('../most');
var rx = require('rx');
var bacon = require('baconjs');
var kefir = require('kefir');
var lodash = require('lodash');
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


//timeMost(); // or
//timeRx(); // or
//timeBacon();
timeMost()
//timeArray()
//timeMost()
		.then(timeLodash)
		//.then(timeArray)
		.then(timeKefir)
		.then(timeRx)
		.then(timeBacon);

function runArray(a) {
	//return Promise.resolve(a.filter(even).map(add1).reduce(sum, 0));
	return a.filter(even).map(add1).reduce(sum, 0);
}

function runLodash(a) {
	//return Promise.resolve(lodash.reduce(lodash.map(lodash.filter(a, even), add1), sum, 0));
	//return Promise.resolve(lodash(a).filter(even).map(add1).reduce(sum, 0));
	return lodash(a).filter(even).map(add1).reduce(sum, 0);
}

function runMost(a) {
	return most.from(a).filter(even).map(add1).reduce(sum, 0);
	//return most2.from(a).flatMap(add1s(most.of)).filter(even).map(add1).reduce(sum, 0);
}

function runRx(a) {
	return rx.Observable.fromArray(a).filter(even).map(add1).reduce(sum, 0);
	//return rx.Observable.fromArray(a).filter(even).flatMap(add1s(rx.Observable.of)).reduce(sum, 0);
	//return rx.Observable.fromArray(a).flatMap(add1s(rx.Observable.of)).filter(even).map(add1).reduce(sum, 0);
}

function runBacon(a) {
	return bacon.fromArray(a).filter(even).map(add1).reduce(0, sum);
	//return bacon.fromArray(a).filter(even).flatMap(add1s(bacon.once)).reduce(0, sum);
	//return bacon.fromArray(a).flatMap(add1s(bacon.once)).filter(even).map(add1).reduce(0, sum);
}

function runKefir(a) {
	return kefirFromArray(a).filter(even).map(add1).reduce(sum, 0);
	//return kefirFromArray(a).filter(even).flatMap(add1s(kefirOf)).reduce(sum, 0);
	//return kefirFromArray(a).flatMap(add1s(kefirOf)).filter(even).map(add1).reduce(0, sum);
}

function kefirOf(x) {
	return kefir.fromBinder(function(emitter) {
		emitter.emit(x);
		emitter.end();
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

function sum(x, y) {
	return x + y;
}

function add1(x) {
	return x + 1;
}

function add1s(of) {
	return function(x) {
		return of(add1(x));
	}
}

function even(x) {
	return x % 2 === 0;
}

function noop() {}
