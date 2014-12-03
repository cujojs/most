/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var ChainDisposable = require('../disposable/ChainDisposable');
var EmptyDisposable = require('../disposable/EmptyDisposable');
var identity = require('../base').identity;
var Promise = require('../Promise');

var all = Promise.all;
var resolve = Promise.resolve;

exports.flatMap = flatMap;
exports.join = join;

function flatMap(f, stream) {
	return new Stream(new Join(f, stream.source));
}

function join(stream) {
	return flatMap(identity, stream);
}

function Join(f, source) {
	this.f = f;
	this.source = source;
}

Join.prototype.run = function(sink) {
	var outer = new OuterJoinSink(this.f, sink);
	return new ChainDisposable(outer, this.source.run(outer));
};

function OuterJoinSink(f, sink) {
	this.f = f;
	this.sink = sink;
	this.inners = new LinkedList();
	this.active = true;
}

OuterJoinSink.prototype.event = function(t, x) {
	var stream = this.f(x);

	var innerSink = new InnerJoinSink(t, this, this.sink);
	this.inners.add(innerSink);
	innerSink.disposable = stream.source.run(innerSink);
};

OuterJoinSink.prototype.end = function(t, x) {
	this.active = false;
	this._checkEnd(t, x);
};

OuterJoinSink.prototype.error = function(t, e) {
	this.active = false;
	this.sink.error(t, e);
};

OuterJoinSink.prototype.dispose = function() {
	this.active = false;
	return this.inners.dispose();
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

function LinkedList() {
	this.head = null;
}

LinkedList.prototype.add = function(x) {
	if(this.head !== null) {
		this.head.prev = x;
		x.next = this.head;
	}
	this.head = x;
};

LinkedList.prototype.remove = function(x) {
	if(x === this.head) {
		this.head = this.head.next;
	}
	if(x.next !== null) {
		x.next.prev = x.prev;
		x.next = null;
	}
	if(x.prev !== null) {
		x.prev.next = x.next;
		x.prev = null;
	}
};

LinkedList.prototype.isEmpty = function() {
	return this.head === null;
};

LinkedList.prototype.dispose = function() {
	if(this.isEmpty()) {
		return resolve();
	}

	var promises = [];
	var x = this.head;
	this.head = null;

	while(x !== null) {
		promises.push(x.dispose());
		x = x.next;
	}

	return all(promises);
};
