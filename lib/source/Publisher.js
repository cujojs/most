/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var sink = require('../sink/sink');
var base = require('../base');

var tryEvent = sink.tryEvent;
var tryEnd   = sink.tryEnd;

module.exports = Publisher;

function Publisher() {
	this.sinks = [];
	this.active = true;
	this.stream = new Stream(new PublisherSource(this));
}

Publisher.prototype.event = function(x) {
	this._checkState();

	var s = this.sinks;

	for(var i=0, rec; i<s.length; ++i) {
		rec = s[i];
		tryEvent(rec.scheduler.now(), x, rec.sink);
	}
};

Publisher.prototype.end = function(x) {
	this._checkState();
	this.active = false;

	var s = this.sinks;

	for(var i=0, rec; i<s.length; ++i) {
		rec = s[i];
		tryEnd(rec.scheduler.now(), x, rec.sink);
	}
};

Publisher.prototype.error = function(e) {
	this._checkState();
	this.active = false;

	var s = this.sinks;

	for(var i=0, rec; i<s.length; ++i) {
		rec = s[i];
		rec.sink.error(rec.scheduler.now(), e);
	}
};

Publisher.prototype._checkState = function() {
	if(!this.active) {
		throw new Error('stream ended');
	}
};

function PublisherSource(publisher) {
	this.publisher = publisher;
}

PublisherSource.prototype.run = function(sink, scheduler) {
	var rec = { sink: sink, scheduler: scheduler };
	this.publisher.sinks = base.append(rec, this.publisher.sinks);
	return new PublisherDisposable(rec, this.publisher);
};

function PublisherDisposable(target, publisher) {
	this.target = target;
	this.publisher = publisher;
}

PublisherDisposable.prototype.dispose = function() {
	this.publisher.sinks = remove(this.target, this.publisher.sinks);
};

function remove(x, a) {
	return base.remove(base.findIndex(x, a), a);
}