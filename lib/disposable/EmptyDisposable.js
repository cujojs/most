/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var noop = require('../base').noop;

module.exports = EmptyDisposable;

function EmptyDisposable() {}

EmptyDisposable.prototype.dispose = noop;