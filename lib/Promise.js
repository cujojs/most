/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/**
 * Abstract the particular Promise in use.  Using when's es6-shim
 * for now as native Promise impl performance is not yet
 * acceptable.
 */

module.exports = require('when/es6-shim/promise');
