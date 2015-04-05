/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var base = require('../base');
var resolve = require('../Promise').resolve;
var Disposable = require('../disposable/Disposable');

module.exports = AsyncSource;

function AsyncSource(source) {
	this.source = source;
}

AsyncSource.prototype.run = function(sink, scheduler) {
	var task = new StartAsyncTask(this.source, sink, scheduler);
	var disposable = scheduler.asap(task);

	return new Disposable(asyncDispose, disposable);
};

function asyncDispose(disposable) {
	return resolve(disposable).then(dispose);
}

function dispose(disposable) {
	if(disposable === void 0) {
		return;
	}
	return disposable.dispose();
}

function StartAsyncTask(source, sink, scheduler) {
	this.source = source;
	this.sink = sink;
	this.scheduler = scheduler;
}

StartAsyncTask.prototype.run = function() {
	return this.source.run(this.sink, this.scheduler);
};

StartAsyncTask.prototype.error = function(t, e) {
	this.sink.error(t, e);
};

StartAsyncTask.prototype.dispose = base.noop;