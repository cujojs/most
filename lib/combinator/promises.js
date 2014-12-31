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

PromiseSource.prototype.run = function(sink, scheduler) {
	return new PromiseProducer(this.promise, sink, scheduler);
};

function PromiseProducer(p, sink, scheduler) {
	this.sink = sink;
	this.scheduler = scheduler;
	this.running = true;

	var self = this;
	resolve(p).then(function(x) {
		self._emit(self.scheduler.now(), x);
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

Await.prototype.run = function(sink, scheduler) {
	return this.source.run(new AwaitSink(sink, scheduler), scheduler);
};

function AwaitSink(sink, scheduler) {
	this.sink = sink;
	this.scheduler = scheduler;
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

AwaitSink.prototype.error = function(t, e) {
	var self = this;
	this.queue = this.queue.then(function() {
		// Don't resolve error values, propagate directly
		self.sink.error(Math.max(t, self.scheduler.now()), e);
	});
};

AwaitSink.prototype._event = function(t, promise) {
	var self = this;
	return promise.then(function(x) {
		self.sink.event(Math.max(t, self.scheduler.now()), x);
	});
};

AwaitSink.prototype._end = function(t, promise) {
	var self = this;
	return resolve(promise).then(function(x) {
		self.sink.end(Math.max(t, self.scheduler.now()), x);
	});
};
