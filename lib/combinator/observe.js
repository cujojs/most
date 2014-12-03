/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var SafeSink = require('../sink/SafeSink');
var EndValueSink = require('../sink/EndValueSink');
var Promise = require('../Promise');
var resolve = Promise.resolve;

exports.observe = observe;
exports.drain = drain;

function observe(f, stream) {
	var source = stream.source;
	var disposable;

	return new Promise(function(res, rej) {
		var observer = new Observer(f, function (x) {
			resolve(disposable.dispose()).then(function () {
				res(x);
			}, rej);
		});

		disposable = source.run(new SafeSink(observer));
	});
}

function Observer(event, end) {
	this._event = event;
	this._end = end;
}

Observer.prototype.event = function(t, x) {
	this._event(x);
};

Observer.prototype.end = function(t, x) {
	this._end(x);
};

function drain(stream) {
	var source = stream.source;
	var disposable;

	return new Promise(function(res, rej) {
		var end = new EndValueSink(function (x) {
			resolve(disposable.dispose()).then(function () {
				res(x);
			}, rej);
		});

		disposable = source.run(new SafeSink(end));
	});
}
