var promise = require('../promises');
var Stream = require('../../Stream');
var step = require('../step');

exports.merge = merge;
exports.mergeAll = mergeAll;

var raceIndex = promise.raceIndex;
var when = promise.when;
var Yield = step.Yield;
var End = step.End;

var slice = Array.prototype.slice;

function merge(/*...observables*/) {
	return mergeArray(slice.call(arguments));
}

function mergeArray(observables) {
	return new Stream(stepMerge, observables.map(initStep));
}

function mergeAll(observableOfObservables) {
	return Stream.fromPromise(toArray(observableOfObservables)).flatMap(mergeArray);
}

function stepMerge(s) {
	if(s.length === 0) {
		return new End();
	}

	if(s[0].i === void 0) {
		return stepI(s.map(function(s) {
			return stepPair(s.stream);
		}));
	}

	return stepI(s);
}

function stepI(s) {
	return raceIndex(function(i, index) {
		return handleStep(s, i, index);
	}, s.map(getI));
}

function handleStep(s, i, index) {
	return i.done ? stepI(without(index, s))
		: new Yield(i.value, stepAtIndex(s, i, index));
}

function stepAtIndex(s, i, index) {
	return s.map(function (sn, j) {
		return j === index ? stepPair(new Stream(sn.stream.step, i.state)) : sn;
	});
}

function stepPair(stream) {
	return { stream: stream, i: when(stream.step, stream.state) };
}

function initStep(s) {
	return { stream: s, i: void 0 };
}

function getI(s) {
	return s.i;
}

function without(i, a) {
	return a.filter(function(x, ai) {
		return i !== ai;
	});
}

function toArray (observableOfObservables) {
	return observableOfObservables.reduce(function (a, obs) {
		a.push(obs);
		return a;
	}, []);
}
