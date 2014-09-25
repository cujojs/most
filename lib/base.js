/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

exports.identity = identity;
exports.cons = cons;
exports.append = append;
exports.tail = tail;
exports.copy = copy;
exports.map = map;
exports.reduce = reduce;
exports.replace = replace;
exports.findIndex = findIndex;

function identity(x) {
	return x;
}

function cons(x, array) {
	var l = array.length;
	var a = new Array(l + 1);
	a[0] = x;
	for(var i=0; i<l; ++i) {
		a[i + 1] = array[i];
	}
	return a;
}

function append(x, a) {
	var l = a.length;
	var b = new Array(l+1);
	for(var i=0; i<l; ++i) {
		b[i] = a[i];
	}

	b[l] = x;
	return b;
}

function tail(array) {
	var l = array.length - 1;
	var a = new Array(l);
	for(var i=0; i<l; ++i) {
		a[i] = array[i + 1];
	}
	return a;
}

function copy(array) {
	var l = array.length;
	var a = new Array(l);
	for(var i=0; i<l; ++i) {
		a[i] = array[i];
	}
	return a;
}

function map(f, array) {
	var l = array.length;
	var a = new Array(l);
	for(var i=0; i<l; ++i) {
		a[i] = f(array[i]);
	}
	return a;
}

function reduce(f, z, array) {
	var r = z;
	for(var i=0, l=array.length; i<l; ++i) {
		r = f(r, array[i], i);
	}
	return r;
}

function replace(x, i, array) {
	var l = array.length;
	var a = new Array(l);
	for(var j=0; j<l; ++j) {
		a[j] = i === j ? x : array[j];
	}
	return a;
}

function findIndex(p, a) {
	for(var i= 0, l= a.length; i<l; ++i) {
		if(p(a[i])) {
			return i;
		}
	}
	return -1;
}
