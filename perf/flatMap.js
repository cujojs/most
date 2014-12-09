var most = require('../most');
var rx = require('rx');
var bacon = require('baconjs');
var kefir = require('kefir');
var lodash = require('lodash');
var Promise = require('when/lib/Promise');

rx.config.Promise = Promise; // ensure rx uses the same Promise

// flatMapping n streams, each containing m items.
// Results in a single stream that merges in n x m items
var n = 1000, m = 1000;
var a = build(m, n);
console.log('ready: ' + n + ' x ' + m);

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


timeMost()
		.then(timeLodash)
		//.then(timeArray)
		.then(timeKefir)
		.then(timeRx)
		.then(timeBacon);

function runArray(a) {
	//return Promise.resolve(a.filter(even).map(add1).reduce(sum, 0));
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
