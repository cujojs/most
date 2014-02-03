var curry = require('./lib/curry');

exports.map = curry(map);
exports.ap = curry(ap);
exports.flatMap = curry(flatMap);

exports.foldl = curry(foldl);
exports.foldl1 = curry(foldl1);
exports.foldr = curry(foldr);
exports.foldr1 = curry(foldr1);

exports.reduce = reduce;
exports.reduceRight = reduceRight;

exports.traverse = curry(traverse);
exports.sequence = curry(sequence);

// Functor

function map(f, x) {
	if(typeof x.map === 'function') {
		return x.map(f);
	}
	return f(x);
}

// Applicative

function ap(applicative, a) {
	if(typeof applicative.ap === 'function') {
		return applicative.ap(a);
	}

	return flatMap(function(f) {
		return map(f, a);
	}, applicative);
}

// Monad

function flatMap(f, monad) {
	if(typeof monad.flatMap === 'function') {
		return monad.flatMap(f);
	} else if(Array.isArray(monad)) {
		return flatMapArray(f, monad);
	}

	throw new Error('Not flatMappable');
}

// Foldable

function foldl(f, initial, foldable) {
	if(typeof foldable.foldl === 'function') {
		return foldable.foldl(f, initial);
	} else if(typeof foldable.reduce === 'function') {
		return foldable.reduce(f, initial);
	}

	throw new Error('Not foldable');
}

function foldl1(f, foldable) {
	if(typeof foldable.foldl1 === 'function') {
		return foldable.foldl1(f, initial);
	} else if(typeof foldable.reduce === 'function') {
		return foldable.reduce(f);
	}

	throw new Error('Not foldable');
}

function foldr(f, initial, foldable) {
	if(typeof foldable.foldr === 'function') {
		return foldable.foldr(f, initial);
	} else if(typeof foldable.reduceRight === 'function') {
		return foldable.reduceRight(f, initial);
	}

	throw new Error('Not foldable');
}

function foldr1(f, foldable) {
	if(typeof foldable.foldr1 === 'function') {
		return foldable.foldr1(f, initial);
	} else if(typeof foldable.reduceRight === 'function') {
		return foldable.reduceRight(f);
	}

	throw new Error('Not foldable');
}

function reduce(foldable, f, initial) {
	return arguments.length > 2 ? foldl(f, initial, foldable) : foldl1(f, foldable);
}

function reduceRight(foldable, f, initial) {
	return arguments.length > 2 ? foldr(f, initial, foldable) : foldr1(f, foldable);
}

// Traversible

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

// Array helpers

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
