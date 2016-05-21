/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Scheduler = require('./Scheduler');
var ClockTimer = require('./ClockTimer');
var Timeline = require('./Timeline');

module.exports = new Scheduler(new ClockTimer(), new Timeline());
