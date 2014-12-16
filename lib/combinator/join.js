/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var AwaitingDisposable = require('../disposable/AwaitingDisposable');
var EmptyDisposable = require('../disposable/EmptyDisposable');
var identity = require('../base').identity;
var LinkedList = require('../LinkedList');
var all = require('../Promise').all;

exports.flatMap = flatMap;
exports.join = join;

/**
 * Map each value in the stream to a new stream, and merge it into the
 * returned stream.
 * @param {function(x:*):Stream} f chaining function, must return a Stream
 * @param {Stream} stream
 * @returns {Stream} new stream containing all items from each stream returned by f
 */
function flatMap(f, stream) {
	return new Stream(new Join(f, stream.source));
}

/**
 * Monadic join. Flatten a Stream<Stream<X>> to Stream<X> by merging inner
 * streams to the outer.  Event arrival times are preserved.
 * @param {Stream<Stream>} stream stream of streams
 * @returns {Stream}
 */
function join(stream) {
	return flatMap(identity, stream);
}

function Join(f, source) {
	this.f = f;
	this.source = source;
}

Join.prototype.run = function(sink) {
	return new OuterJoinSink(this.f, this.source, sink);
};

function OuterJoinSink(f, source, sink) {
	this.f = f;
	this.sink = sink;
	this.inners = new LinkedList();
	this.disposable = source.run(this);
	this.active = true;
}

OuterJoinSink.prototype.event = function(t, x) {
	var f = this.f;
	var stream = f(x);

	var innerSink = new InnerJoinSink(t, this, this.sink);
	this.inners.add(innerSink);
	innerSink.disposable = stream.source.run(innerSink);
};

OuterJoinSink.prototype.end = function(t, x) {
	this.active = false;
	var disposable = this.disposable;
	this.disposable = new AwaitingDisposable(disposable.dispose());
	this._checkEnd(t, x);
};

OuterJoinSink.prototype.error = function(t, e) {
	this.active = false;
	this.sink.error(t, e);
};

OuterJoinSink.prototype.dispose = function() {
	this.active = false;
	return all([this.disposable.dispose(), this.inners.dispose()]);
};

OuterJoinSink.prototype._endInner = function(t, x, inner) {
	inner.dispose(); // TODO: capture result
	this.inners.remove(inner);
	this._checkEnd(t, x);
};

OuterJoinSink.prototype._checkEnd = function(t, x) {
	if(!this.active && this.inners.isEmpty()) {
		this.sink.end(t, x);
	}
};

function InnerJoinSink(startTime, outer, sink) {
	this.prev = this.next = null;
	this.startTime = startTime;
	this.outer = outer;
	this.sink = sink;
	this.disposable = new EmptyDisposable();
}

InnerJoinSink.prototype.event = function(t, x) {
	this.sink.event(Math.max(t, this.startTime), x);
};

InnerJoinSink.prototype.end = function(t, x) {
	this.outer._endInner(Math.max(t, this.startTime), x, this);
};

InnerJoinSink.prototype.error = function(t, e) {
	this.outer.error(t, e);
};

InnerJoinSink.prototype.dispose = function() {
	return this.disposable.dispose();
};
