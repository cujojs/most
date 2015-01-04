var most = require('../../most');
var rx = require('rx');
var bacon = require('baconjs');
var kefir = require('kefir');
var lodash = require('lodash');
var highland = require('highland');
var Promise = require('when/lib/Promise');

rx.config.Promise = Promise; // ensure rx uses the same Promise

var runners = {
	most: timeMost,
	lodash: timeLodash,
	array: timeArray,
	kefir: timeKefir,
	bacon: timeBacon,
	rx: timeRx,
	highland: timeHighland
};

exports.run = run;

exports.timeMost = timeMost;
exports.timeRx = timeRx;
exports.timeBacon = timeBacon;
exports.timeKefir = timeKefir;
exports.kefirFromArray = kefirFromArray;
exports.timeHighland = timeHighland;
exports.timeLodash = timeLodash;
exports.timeArray = timeArray;

exports.gc = gc;

function run(libs, msg, x) {
	console.log('START ' + msg);
	separator();

	gc();

	return Object.keys(runners).reduce(function(p, lib) {
		return runTest(p, lib, runners[lib], libs[lib], x);
	}, Promise.resolve()).then(separator);
}

function runTest(p, name, runner, test, x) {
	return p.then(function() {
		if(typeof test !== 'function') {
			return Promise.resolve();
		}

		return runner(test, x);
	}).catch(function(e) {
		console.error(pad(10, name) + 'FAILED: ' + e);
	});
}

function gc() {
	if(global && typeof global.gc === 'function') {
		global.gc();
	}
}

function noop() {}

function elapsed(name, start, z) {
	var t = Date.now() - start;
	var s = pad(10, name) + pad(10, t + 'ms');
	if(arguments.length > 2) {
		s += 'result: ' + z;
	}
	console.log(s);
}

function pad(n, s) {
	while(s.length < n) {
		s += ' ';
	}
	return s;
}

function separator () {
	console.log('---------------------------------------------------------');
}

function timeRx (runRx, a) {
	gc();
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
						elapsed('rx', start, result);
						resolve();
					}
				});
			}
		});
	});
}

function timeBacon (runBacon, a) {
	gc();
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
				elapsed('bacon', start, result);
				resolve();
			});
		});
	});
}

function timeKefir(runKefir, a) {
	gc();
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
				elapsed('kefir', start, result);
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

function timeMost (runMost, a) {
	gc();
	return runMost(a).then(function() {
		var start = Date.now();
		return runMost(a).then(function (z) {
			elapsed('most', start, z);
		});
	});
}

function timeArray (runArray, a) {
	gc();
	runArray(a);
	var start = Date.now();
	var z = runArray(a);
	elapsed('Array', start, z);
}

function timeLodash(runLodash, a) {
	gc();
	runLodash(a);
	var start = Date.now();
	var z = runLodash(a);
	elapsed('lodash', start, z);
}

// Using pull() seems to give the fastest results for highland,
// but will only work for test runs that reduce a stream to a
// single value.
function timeHighland(runHighland, a) {
	gc();
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

				elapsed('highland', start, z);
				resolve(z);
			});
		});
	});
}