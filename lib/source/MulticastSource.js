/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var union = require('lodash/array/union');
var without = require('lodash/array/without');
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
		this._disposable = this.source.run(this.sink, scheduler);
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
	this.sinks = union(this.sinks, [sink]);
	return this.sinks.length;
};

MulticastSink.prototype.remove = function(sink) {
	this.sinks = without(this.sinks, sink);
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
