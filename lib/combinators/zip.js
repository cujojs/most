var Stream = require('../../Stream');
var promise = require('../promises');
var step = require('../step');

exports.zipWith = zipWith;
exports.zip = zip;
exports.zipArrayWith = zipArrayWith;

var when = promise.when;
var Promise = promise.Promise;

var isDone = step.isDone;
var getValue = step.getValue;
var Yield = step.Yield;
var End = step.End;

var slice = Array.prototype.slice;

function zipWith(f /*,...observables*/) {
	return zipArrayWith(f, slice.call(arguments, 1));
}

function zip(/*...observables*/) {
	return zipArrayWith(toArray, slice.call(arguments, 0));
}

function zipArrayWith(f, observables) {
	return new Stream(function(ss) {
		return stepZip(f, ss);
	}, observables);
}

function stepZip (f, streams) {
	return stepAll(streams).then(function (is) {
		if (is.some(isDone)) {
			return new End();
		}

		var value = f.apply(void 0, is.map(getValue));
		return new Yield(value, is.map(function (it, i) {
			return new Stream(streams[i].step, it.state);
		}));
	});
}

function stepAll(streams) {
	return Promise.all(streams.map(streamNext));
}

function streamNext(s) {
	return when(s.step, s.state);
}

function toArray() {
	return slice.call(arguments);
}