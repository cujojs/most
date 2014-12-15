/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var of = require('../source/core').of;
var flatMapEnd = require('./flatMapEnd').flatMapEnd;
var scheduler = require('../Scheduler');
var fatal = require('../fatalError');
var identity = require('../base').identity;

exports.unfold = unfold;
exports.iterate = iterate;
exports.repeat = repeat;
exports.concat = concat;
exports.cycle = cycle;
exports.cons = cons;

function cons(x, stream) {
	return concat(of(x), stream);
}

function concat(left, right) {
	return flatMapEnd(function() {
		return right;
	}, left);
}

function cycle(stream) {
	return flatMapEnd(function() {
		return cycle(stream);
	}, stream);
}

/**
 * Build a stream by unfolding steps from a seed value
 * @param {function(x:*):Step} f
 * @param {*} x seed value
 * @returns {Stream} stream containing all items
 */
function unfold(f, x) {
	return new Stream(new UnfoldSource(runUnfold, f, x));
}

/**
 * Build a stream by iteratively calling f
 * @param {function(x:*):*} f
 * @param {*} x initial value
 * @returns {Stream}
 */
function iterate(f, x) {
	return new Stream(new UnfoldSource(startIterate, f, x));
}

/**
 * Create an infinite stream of xs
 * @param {*} x
 * @returns {Stream} infinite stream where all items are x
 */
function repeat(x) {
	return iterate(identity, x);
}

function UnfoldSource(run, f, x) {
	this.f = f;
	this.value = x;
	this._run = run;
}

UnfoldSource.prototype.run = function(sink) {
	return new Unfold(this._run, this.f, this.value, sink);
};

function Unfold(run, f, x, sink) {
	this.run = run;
	this.f = f;
	this.value = x;
	this.sink = sink;
	this.active = true;
	scheduler.asap(run, error, this);
}

Unfold.prototype.dispose = function() {
	this.active = false;
};

function runUnfold(unfold) {
	if(!unfold.active) {
		return;
	}

	var f = unfold.f;
	var pair = f(unfold.value);

	unfold.value = pair.state;
	unfold.sink.event(scheduler.now(), pair.value);

	this.scheduler.asap(unfold.run, error, unfold);
}

function startIterate(iterate) {
	if(!iterate.active) {
		return;
	}

	iterate.sink.event(0, iterate.value);
	this.scheduler.asap(runIterate, error, iterate);
}

function runIterate(iterate) {
	if(!iterate.active) {
		return;
	}

	var f = iterate.f;

	iterate.value = f(iterate.value);
	iterate.sink.event(scheduler.now(), iterate.value);

	this.scheduler.asap(runIterate, error, iterate);
}

function error(e) {
	var producer = this._x;
	if(!producer.active) {
		fatal(e);
	}
	producer.sink.error(0, e);
}