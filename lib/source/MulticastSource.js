/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var base = require('../base');
var resolve = require('../Promise').resolve;

module.exports = MulticastSource;

function MulticastSource(source) {
	this.source = source;
	this.sink = new MulticastSink();
	this._disposable = void 0;
}

MulticastSource.prototype.run = function(sink, scheduler) {
	var n = this.sink.add(sink);
	if(n === 1) {
		var task = new StartMulticastTask(this.source, this.sink, scheduler);
		this._disposable = scheduler.asap(task);
	}

	return new MulticastDisposable(this, sink);
};

MulticastSource.prototype._dispose = function() {
	return resolve(this._disposable).then(dispose);
};

function dispose(disposable) {
	if(disposable === void 0) {
		return;
	}
	return disposable.dispose();
}

function StartMulticastTask(source, sink, scheduler) {
	this.source = source;
	this.sink = sink;
	this.scheduler = scheduler;
}

StartMulticastTask.prototype.run = function() {
	return this.source.run(this.sink, this.scheduler);
};

StartMulticastTask.prototype.error = function(t, e) {
	this.sink.error(t, e);
};

StartMulticastTask.prototype.dispose = base.noop;

function MulticastDisposable(source, sink) {
	this.source = source;
	this.sink = sink;
}

MulticastDisposable.prototype.dispose = function() {
	var s = this.source;
	var remaining = s.sink.remove(this.sink);
	return remaining === 0 && s._dispose();
};

function MulticastSink() {
	this.sinks = [];
}

MulticastSink.prototype.add = function(sink) {
	this.sinks = base.append(sink, this.sinks);
	return this.sinks.length;
};

MulticastSink.prototype.remove = function(sink) {
	this.sinks = base.remove(base.findIndex(sink, this.sinks), this.sinks);
	return this.sinks.length;
};

MulticastSink.prototype.event = function(t, x) {
	var s = this.sinks;
	for(var i=0; i<s.length; ++i) {
		s[i].event(t, x);
	}
};

MulticastSink.prototype.end = function(t, x) {
	var s = this.sinks;
	for(var i=0; i<s.length; ++i) {
		s[i].end(t, x);
	}
};

MulticastSink.prototype.error = function(t, e) {
	var s = this.sinks;
	for (var i=0; i<s.length; ++i) {
		s[i].error(t, e);
	}
};