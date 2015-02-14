/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var resolve = require('../Promise').resolve;
var fatal = require('../fatalError');

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
	this.active = true;

	var self = this;
	resolve(p).then(function(x) {
		self._emit(self.scheduler.now(), x);
	}).catch(function(e) {
		self._error(self.scheduler.now(), e);
	});
}

PromiseProducer.prototype._emit = function(t, x) {
	if(!this.active) {
		return;
	}

	this.sink.event(t, x);
	this.sink.end(t, void 0);
};

PromiseProducer.prototype._error = function(t, e) {
	if(!this.active) {
		return;
	}

	this.sink.error(t, e);
};

PromiseProducer.prototype.dispose = function() {
	this.active = false;
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
	this.queue = void 0;
}

AwaitSink.prototype.event = function(t, promise) {
	var self = this;
	this.queue = resolve(this.queue).then(function() {
		return self._event(t, promise);
	}).catch(function(e) {
		return self._error(t, e);
	});
};

AwaitSink.prototype.end = function(t, x) {
	var self = this;
	this.queue = resolve(this.queue).then(function() {
		return self._end(t, x);
	}).catch(function(e) {
		return self._error(t, e);
	});
};

AwaitSink.prototype.error = function(t, e) {
	var self = this;
	this.queue = resolve(this.queue).then(function() {
		return self._error(t, e);
	}).catch(fatal);
};

AwaitSink.prototype._error = function(t, e) {
	try {
		// Don't resolve error values, propagate directly
		this.sink.error(Math.max(t, this.scheduler.now()), e);
	} catch(e) {
		fatal(e);
		throw e;
	}
};

AwaitSink.prototype._event = function(t, promise) {
	var self = this;
	return promise.then(function(x) {
		self.sink.event(Math.max(t, self.scheduler.now()), x);
	});
};

AwaitSink.prototype._end = function(t, x) {
	var self = this;
	return resolve(x).then(function(x) {
		self.sink.end(Math.max(t, self.scheduler.now()), x);
	});
};
