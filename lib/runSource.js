/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Promise = require('./Promise');
var Observer = require('./sink/Observer');
var scheduler = require('./scheduler/defaultScheduler');

var resolve = Promise.resolve;

module.exports = runSource;

function runSource(f, source) {
	return new Promise(function (res, rej) {
		var disposable;
		var observer = new Observer(f,
			function (x) {
				disposeThen(res, rej, disposable, x);
			}, function (e) {
				disposeThen(rej, rej, disposable, e);
			});

		disposable = source.run(observer, scheduler);
	});
}

function disposeThen(res, rej, disposable, x) {
	resolve(disposable.dispose()).then(function () {
		res(x);
	}, rej);
}

