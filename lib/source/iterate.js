/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var scheduler = require('../Scheduler');
var Promise = require('../Promise');
var identity = require('../base').identity;

exports.iterate = iterate;
exports.repeat = repeat;

/**
 * Build a stream by iteratively calling f
 * @param {function(x:*):*} f
 * @param {*} x initial value
 * @returns {Stream}
 */
function iterate(f, x) {
	return new Stream(new IterateSource(f, x));
}

/**
 * Create an infinite stream of xs
 * @param {*} x
 * @returns {Stream} infinite stream where all items are x
 */
function repeat(x) {
	return iterate(identity, x);
}

function IterateSource(f, x) {
	this.f = f;
	this.value = x;
}

IterateSource.prototype.run = function(sink) {
	return new Iterate(this.f, this.value, sink);
};

function Iterate(f, x, sink) {
	this.f = f;
	this.sink = sink;
	this.active = true;

	var self = this;
	function err(e) {
		self.sink.error(scheduler.now(), e);
	}

	function start(iterate) {
		return stepIterate(iterate, x);
	}

	Promise.resolve(this).then(start).catch(err);
}

Iterate.prototype.dispose = function() {
	this.active = false;
};

function stepIterate(iterate, x) {
	iterate.sink.event(scheduler.now(), x);

	if(!iterate.active) {
		return x;
	}

	var f = iterate.f;
	return continueIterate(iterate, f(x));
}

function continueIterate(iterate, x) {
	if(!iterate.active) {
		return iterate.value;
	}

	return Promise.resolve(x).then(function(x) {
		return stepIterate(iterate, x);
	});
}
