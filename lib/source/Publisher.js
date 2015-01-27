/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var sink = require('../sink/sink');

var tryEvent = sink.tryEvent;
var tryEnd   = sink.tryEnd;

module.exports = Publisher;

function Publisher() {
	this.sinks = [];
	this.active = true;
	this.stream = new Stream(new PublisherSource(this.sinks));
}

Publisher.prototype.event = function(x) {
	this._checkState();

	var s = this.sinks.slice();

	for(var i=0, rec; i<s.length; ++i) {
		rec = s[i];
		tryEvent(rec.scheduler.now(), x, rec.sink);
	}
};

Publisher.prototype.end = function(x) {
	this._checkState();
	this.active = false;

	var s = this.sinks.slice();
	this.sinks = void 0;

	for(var i=0, rec; i<s.length; ++i) {
		rec = s[i];
		tryEnd(rec.scheduler.now(), x, rec.sink);
	}
};

Publisher.prototype.error = function(e) {
	this._checkState();
	this.active = false;

	var s = this.sinks.slice();
	this.sinks = void 0;

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

function PublisherSource(sinks) {
	this.sinks = sinks;
}

PublisherSource.prototype.run = function(sink, scheduler) {
	var rec = { sink: sink, scheduler: scheduler };
	this.sinks.push(rec);
	return new PublisherDisposable(rec, this.sinks);
};

function PublisherDisposable(target, sinks) {
	this.target = target;
	this.sinks = sinks;
}

PublisherDisposable.prototype.dispose = function() {
	this.sinks.splice(this.sinks.indexOf(this.target), 1);
	this.sinks = void 0;
};
