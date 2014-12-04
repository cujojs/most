/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var Disposable = require('../disposable/Disposable');
var MulticastSource = require('./MulticastSource');

exports.create = create;

function create(run) {
	return new Stream(new MulticastSource(new SubscriberSource(run)));
}

function SubscriberSource(run) {
	this._run = run;
}

SubscriberSource.prototype.run = function(sink) {
	var dispose = this._run(add, end);
	if(typeof dispose !== 'function') {
		dispose = noop;
	}

	function add(x) {
		sink.event(Date.now(), x);
	}

	function end(x) {
		sink.end(Date.now(), x);
	}

	return new Disposable(dispose);
};

function noop() {}