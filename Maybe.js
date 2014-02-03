var nothing;

module.exports = Maybe;

function Maybe(x) {
	this.value = x;
}

Maybe.of = of;
Maybe.empty = empty;

function of(x) {
	return new Maybe(x);
}

function empty() {
	// For Semigroup/Monoid
	return nothing;
}

Maybe.prototype.forEach = function(f) {
	f(this.value);
};

Maybe.prototype.toString = Maybe.prototype.inspect = function() {
	return 'Just ' + this.value.toString();
};

Maybe.prototype.isNothing = function() {
	return false;
};

Maybe.prototype.isJust = function() {
	return !this.isNothing();
};

Maybe.prototype.map = function(f) {
	return of(f(this.value));
};

Maybe.prototype.ap = function(maybe) {
	return this.flatMap(function(f) {
		return maybe.map(f);
	});
};

Maybe.prototype.flatMap = function(f) {
	return f(this.value);
};

Maybe.prototype.concat = function(maybe) {
	/*jshint unused:false*/
	// Semigroup/Monoid
	// See http://en.wikibooks.org/wiki/Haskell/MonadPlus#Definition
	return this;
};

Maybe.prototype.filter = function(predicate) {
	return predicate(this.value) ? this : nothing;
};

Maybe.prototype.maybe = function(f, defaultValue) {
	/*jshint unused:false*/
	return f(this.value);
};

Maybe.prototype.getOrElse = function(defaultValue) {
	/*jshint unused:false*/
	return this.value;
};

Maybe.prototype.foldl = Maybe.prototype.foldr = function(f, initial) {
	return this.isNothing() ? initial : f(initial, this.value);
};

Maybe.prototype.foldl1 = Maybe.prototype.foldr1 = function(f) {
	/*jshint unused:false*/
	return this.value;
};

Maybe.prototype.reduce = function(f) {
	return arguments.length < 2 ? this.foldl1(f) : this.foldl(f, arguments[1]);
};

Maybe.prototype.reduceRight = function(f) {
	return arguments.length < 2 ? this.foldr1(f) : this.foldr(f, arguments[1]);
};

Maybe.prototype.traverse = function(_, f) {
	var of = this.constructor.of;
	return this.value.map(function(x) {
		return of(f(x));
	});
};

Maybe.prototype.sequence = function(T) {
	/*jshint unused:false*/
	return this.value.map(this.constructor.of);
};

// Nothing

nothing = Maybe.nothing = Object.create(Maybe.prototype);

nothing.forEach = noop;

nothing.map
	= nothing.flatMap
	= nothing.ap
	= nothing.filter
	= function() {
		return nothing;
	};

nothing.concat = identity;

nothing.foldl = nothing.foldr = function(_, initial) {
	return initial;
};

nothing.traverse = function(T, f) {
	/*jshint unused:false*/
	return this;
};

nothing.toString = nothing.inspect = function() {
	return 'Nothing';
};

nothing.isNothing = function() {
	return true;
};

nothing.getOrElse = function(defaultValue) {
	return defaultValue;
};

nothing.maybe = function(_, defaultValue) {
	return defaultValue;
};

function noop() {}

function identity(x) { return x; }
