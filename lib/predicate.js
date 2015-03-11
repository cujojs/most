/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

exports.and = function and(p, q) {
	return function(x) {
		return p(x) && q(x);
	};
};
