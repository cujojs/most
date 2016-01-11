/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Scheduler = require('./Scheduler');
var setTimeoutTimer = require('./setTimeoutTimer');
var nodeTimer = require('./nodeTimer');

var isNode = typeof process === 'object'
		&& typeof process.nextTick === 'function';

module.exports = new Scheduler(isNode ? nodeTimer : setTimeoutTimer);
