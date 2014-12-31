/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Scheduler = require('./Scheduler');

module.exports = new Scheduler(defaultSetTimer, defaultClearTimer, Date.now);

// Default timer functions
function defaultSetTimer(f, ms) {
	return setTimeout(f, ms);
}

function defaultClearTimer(t) {
	return clearTimeout(t);
}

