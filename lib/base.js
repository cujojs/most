/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

exports.noop = noop;
exports.identity = identity;
exports.cons = cons;
exports.append = append;
exports.slice = slice;
exports.tail = tail;
exports.copy = copy;
exports.map = map;
exports.reduce = reduce;
exports.insert = insert;
exports.replace = replace;
exports.remove = remove;
exports.findIndex = findIndex;

function noop() {}

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

function slice(start, array) {
	var l = array.length;
	if(start >= l) {
		return [];
	}

	l -= start;
	var a = new Array(l);
	for(var i=0; i<l; ++i) {
		a[i] = array[start+i];
	}
	return a;
}

function tail(array) {
	return slice(1, array);
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

function insert(x, at, a) {
	var l = a.length;
	var b = new Array(l+1);
	var i;
	b[at] = x;
	for(i=0; i<at; ++i) {
		b[i] = a[i];
	}
	for(i=at; i<l; ++i) {
		b[i+1] = a[i];
	}
	return b;
}

function replace(x, i, array) {
	var l = array.length;
	var a = new Array(l);
	for(var j=0; j<l; ++j) {
		a[j] = i === j ? x : array[j];
	}
	return a;
}

function remove(index, array) {
	var l = array.length-1;
	if(l < 0) {
		return array;
	}

	var b = new Array(l);
	var i;
	for(i=0; i<index; ++i) {
		b[i] = array[i];
	}
	for(i=index; i<l; ++i) {
		b[i] = array[i+1];
	}

	return b;
}

function findIndex(x, a) {
	for (var i = 0, l = a.length; i < l; ++i) {
		if (x === a[i]) {
			return i;
		}
	}
	return -1;
}