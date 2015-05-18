/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Promise = require('./Promise');
var Observer = require('./sink/Observer');
var defaultScheduler = require('./scheduler/defaultScheduler');

exports.withDefaultScheduler = withDefaultScheduler;
exports.withScheduler = withScheduler;

function withDefaultScheduler(f, source) {
	return withScheduler(f, source, defaultScheduler);
}

function withScheduler(f, source, scheduler) {
	return new Promise(function (resolve, reject) {
		var disposable;

		var observer = new Observer(f,
			function (x) {
				disposeThen(resolve, reject, disposable, x);
			}, function (e) {
				disposeThen(reject, reject, disposable, e);
			});

		disposable = source.run(observer, scheduler);
	});
}

function disposeThen(resolve, reject, disposable, x) {
	Promise.resolve(disposable.dispose()).then(function () {
		resolve(x);
	}, reject);
}

