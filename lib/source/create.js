/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var MulticastSource = require('./MulticastSource');
var fromSource = require('./fromSource');
var Stream = require('../Stream');

exports.create = create;

function create(run) {
	return fromSource(new MulticastSource(Stream.getDefaultScheduler(), run));
}
