/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var resolve = require('../Promise').resolve;

exports.fromPromise = fromPromise;
exports.await = await;

function fromPromise(p) {
	return new Stream(new PromiseSource(p));
}

function PromiseSource(p) {
	this.promise = p;
}

PromiseSource.prototype.run = function(sink) {
	return new PromiseProducer(this.promise, sink);
};

function PromiseProducer(p, sink) {
	this.sink = sink;
	this.running = true;

	var self = this;
	resolve(p).then(function(x) {
		self._emit(Date.now(), x);
	});
}

PromiseProducer.prototype._emit = function(t, x) {
	if(!this.running) {
		return;
	}

	this.sink.event(t, x);
	this.sink.end(t, void 0);
};

PromiseProducer.prototype.dispose = function() {
	this.running = false;
};

function await(stream) {
	return new Stream(new Await(stream.source));
}

function Await(source) {
	this.source = source;
}

Await.prototype.run = function(sink) {
	return this.source.run(new AwaitSink(sink));
};

function AwaitSink(sink) {
	this.sink = sink;
	this.queue = resolve();
}

AwaitSink.prototype.event = function(t, promise) {
	var self = this;
	this.queue = this.queue.then(function() {
		return self._event(t, promise);
	});
};

AwaitSink.prototype.end = function(t, promise) {
	var self = this;
	this.queue = this.queue.then(function() {
		return self._end(t, promise);
	});
};

Await.prototype.error = function(t, e) {
	var sink = this.sink;
	this.queue = this.queue.then(function() {
		sink.error(t, e); // Don't resolve error values, propagate directly
	});
};

AwaitSink.prototype._event = function(t, promise) {
	var sink = this.sink;
	return promise.then(function(x) {
		sink.event(t, x);
	});
};

AwaitSink.prototype._end = function(t, promise) {
	var sink = this.sink;
	return resolve(promise).then(function(x) {
		sink.end(t, x);
	});
};
