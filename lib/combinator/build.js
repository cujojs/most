/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var of = require('./of').of;
var flatMapEnd = require('./flatMapEnd').flatMapEnd;
var resolve = require('../Promise').resolve;
var scheduler = require('../Scheduler');

exports.cons = cons;
exports.concat = concat;
exports.unfold = unfold;
exports.iterate = iterate;

function cons(x, stream) {
	return concat(of(x), stream);
}

function concat(left, right) {
	return flatMapEnd(function() {
		return right;
	}, left);
}

function unfold(f, x) {
	return new Stream(new UnfoldSource(runUnfold, f, x));
}

function iterate(f, x) {
	return new Stream(new UnfoldSource(startIterate, f, x));
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
	resolve(this).then(run);
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

	return resolve(unfold).then(unfold.run);
}

function startIterate(iterate) {
	if(!iterate.active) {
		return;
	}

	iterate.sink.event(0, iterate.value);
	return resolve(iterate).then(runIterate);
}

function runIterate(iterate) {
	if(!iterate.active) {
		return;
	}

	var f = iterate.f;

	iterate.value = f(iterate.value);
	iterate.sink.event(scheduler.now(), iterate.value);

	return resolve(iterate).then(runIterate);
}