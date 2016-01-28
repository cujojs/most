/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Observer = require('./sink/Observer');
var dispose = require('./disposable/dispose');
var defaultScheduler = require('./scheduler/defaultScheduler');

exports.withDefaultScheduler = withDefaultScheduler;
exports.withScheduler = withScheduler;

function withDefaultScheduler(f, source) {
	return withScheduler(f, source, defaultScheduler);
}

function withScheduler(f, source, scheduler) {
	return new Promise(function (resolve, reject) {
		runSource(f, source, scheduler, resolve, reject);
	});
}

function runSource(f, source, scheduler, resolve, reject) {
	var disposable = dispose.settable();
	var observer = new Observer(f, resolve, reject, disposable);

	disposable.setDisposable(source.run(observer, scheduler));
}
