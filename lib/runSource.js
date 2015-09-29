/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Promise = require('./Promise');
var Observer = require('./sink/Observer');
var SettableDisposable = require('./disposable/SettableDisposable');
var defaultScheduler = require('./scheduler/defaultScheduler');

exports.withDefaultScheduler = withDefaultScheduler;
exports.withScheduler = withScheduler;

function withDefaultScheduler(f, source) {
	return withScheduler(f, source, defaultScheduler);
}

function withScheduler(f, source, scheduler) {
	return new Promise(function (resolve, reject) {
		var disposable = new SettableDisposable();
		var observer = new Observer(f, resolve, reject, disposable);

		disposable.setDisposable(source.run(observer, scheduler));
	});
}
