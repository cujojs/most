/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var MulticastSource = require('./MulticastSource');
var fromSource = require('./fromSource');

exports.create = create;

function create(run) {
	return fromSource(new MulticastSource(run));
}
