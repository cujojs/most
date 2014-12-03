/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var noop = require('../base').noop;

module.exports = EndValueSink;

function EndValueSink(end) {
	this._end = end;
}

EndValueSink.prototype.event = noop;

EndValueSink.prototype.end = function(t, x) {
	this._end(x);
};