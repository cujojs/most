/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

exports.compose = compose;
exports.pipeline = pipeline;

function compose(g, f /*, ... */) {
	var l = arguments.length;

    if(l === 1) {
		return g;
	}

	if(l === 2) {
		return function(x) {
			return g(f(x));
		};
	}

	var fs = new Array(l);
	for(var i=0, j=l; i<l; ++i) {
		fs[i] = arguments[--j];
	}

	return makeComposed(fs);
}

function pipeline(f, g /*, ... */) {
	var l = arguments.length;

	if(l === 1) {
		return f;
	}

	if(l === 2) {
		return compose(g, f);
	}

	var fs = new Array(l);
	for(var i=0; i<l; ++i) {
		fs[i] = arguments[i];
	}

	return makeComposed(fs);
}

function makeComposed(fs) {
	return function(x) {
		var r = x;
		for(var i=0; i<fs.length; ++i) {
			r = fs[i](r);
		}
		return r;
	};
}