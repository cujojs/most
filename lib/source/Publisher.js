/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');

module.exports = Publisher;

function Publisher() {
	this.sinks = [];
	this.active = true;
	this.stream = new Stream(new PublisherSource(this.sinks));
}

Publisher.prototype.event = function(x) {
	if(!this.active) {
		return;
	}
	var s = this.sinks.slice();
	for(var i= 0, rec; i<s.length; ++i) {
		rec = s[i];
		rec.sink.event(rec.scheduler.now(), x);
	}
};

Publisher.prototype.end = function(x) {
	if(!this.active) {
		return;
	}
	this.active = false;

	var s = this.sinks.slice();
	for(var i= 0, rec; i<s.length; ++i) {
		rec = s[i];
		rec.sink.end(rec.scheduler.now(), x);
	}
};

Publisher.prototype.error = function(e) {
	if(!this.active) {
		return;
	}
	this.active = false;

	var s = this.sinks.slice();
	for(var i= 0, rec; i<s.length; ++i) {
		rec = s[i];
		rec.sink.error(rec.scheduler.now(), e);
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
};