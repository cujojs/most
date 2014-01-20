var curry = require('./lib/curry');

exports.map = curry(map);
exports.ap = curry(ap);
exports.flatMap = curry(flatMap);
exports.traverse = curry(traverse);
exports.sequence = curry(sequence);

function map(f, x) {
	if(typeof x.map === 'function') {
		return x.map(f);
	}
	return f(x);
}

function ap(applicative, a) {
	if(typeof applicative.ap === 'function') {
		return applicative.ap(a);
	}

	return flatMap(function(f) {
		return map(f, a);
	}, applicative);
}

function flatMap(f, monad) {
	if(typeof monad.flatMap === 'function') {
		return monad.flatMap(f);
	} else if(Array.isArray(monad)) {
		return flatMapArray(f, monad);
	}
}

function traverse(of, f, traversable) {
	if(typeof traversable.traverse === 'function') {
		return traversable.traverse(of, f);
	} else if(Array.isArray(traversable)) {
		return traverseArray(of, f, traversable);
	}
}

function sequence(of, t) {
	if(typeof t.sequence === 'function') {
		return t.sequence(of, identity);
	} else {
		return traverse(of, identity, t);
	}
}

function identity(x) {
	return x;
}

function flatMapArray(f, array) {
	return array.reduce(function(a, x) {
		return a.concat(f(x));
	}, []);
}

function traverseArray(of, f, array) {
	return array.reduce(consf, of([]));

	function consf(tOfArray, m) {
		return ap(tOfArray, m.map(function(x) {
			return function(array) {
				array.push(f(x));
				return array;
			};
		}));
	}
}
