/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Disposable = require('../disposable/Disposable');
var defer = require('../defer');

module.exports = AsyncSource;

function AsyncSource(source) {
	this.source = source;
}

AsyncSource.prototype.run = function(sink, scheduler) {
	var task = new StartAsyncTask(this.source, sink, scheduler);
	return new Disposable(asyncDispose, defer(task));
};

function asyncDispose(disposable) {
	return disposable.then(dispose);
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

StartAsyncTask.prototype.error = function(e) {
	this.sink.error(0, e);
};
