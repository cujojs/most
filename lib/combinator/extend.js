/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var transform = require('./transform');
var startWith = require('./build').cons;
var multicast = require('@most/multicast').default

var constant = transform.constant;
var map = transform.map;

exports.extend = extend;

function extend(f, stream) {
	var t = multicast(stream);
	return map(f, startWith(t, constant(t, t)))
};
