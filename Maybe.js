/** @license MIT License (c) copyright 2011-2013 original author or authors */

/**
 *
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author Brian Cavalier
 * @author John Hann
 * @author Fabrice Matrat
 */
 
(function (define) { 'use strict';
define(function () {

	Maybe.fromMaybe = fromMaybe;
	Maybe.listToMaybe = listToMaybe;
	Maybe.maybeToList = maybeToList;
	Maybe.catMaybes = catMaybes;
	Maybe.lift = lift;
	Maybe.empty = empty;
	Maybe.of = of;
	Maybe.just = just;

	function Maybe(value) {
		if(value === undefined || value === null) {
			return nothing;
		} else {
			return just(value);
		}

	}

	function fromMaybe(maybe, defaultValue) {
		if(maybe.isNothing()) {
			return defaultValue;
		} else {
			return maybe.getOrElse();
		}
	}

	function listToMaybe(array) {
		if(array == null || array.length === 0) {
			return nothing;
		} else {
			return Maybe.of(array[0]);
		}
	}

	function maybeToList(maybe) {
		if(maybe.isNothing()) {
			return [];
		} else {
			return [maybe.getOrElse()];
		}
	}

	function catMaybes(array) {
		var values = [];
		array.forEach(function(x) {
			x.isJust() && values.push(x.getOrElse());
		});
		return values;
	}

	function lift(f) {
		return function(value) {
			return Maybe.of(f(value));
		};
	}

	function empty() {
		// For Semigroup/Monoid
		return nothing;
	}

	function of(value) {
		return new Maybe(value);
	}

	function just(value) {
		return new Just(value);
	}

	Maybe.prototype.reduce = function(f) {
		return arguments.length < 2 ? this.foldl1(f) : this.foldl(f, arguments[1]);
	};

	Maybe.prototype.reduceRight = function(f) {
		return arguments.length < 2 ? this.foldr1(f) : this.foldr(f, arguments[1]);
	};

	Maybe.prototype.sequence = function(T) {
		/*jshint unused:false*/
		return this._value.map(this.constructor.of);
	};

	Just.prototype = Object.create(Maybe.prototype);

	Just.prototype.constructor = Just;

	function Just(value) {
		this._value = value;
	}

	Just.prototype.isNothing = function() {
		return !this.isJust();
	};

	Just.prototype.isJust = function() {
		return true;
	};

	Just.prototype.getOrElse = function() {
		return this._value;
	};

	Just.prototype.filter = function(predicate) {
		return predicate(this._value) ? this : nothing;
	};

	Just.prototype.map = function(f) {
		return Maybe.just(f(this._value));
	};

	Just.prototype.flatMap = function(f) {
		return f(this._value);
	};

	Just.prototype.ap = function(maybe) {
		return this.flatMap(function(f) {
			return maybe.map(f);
		});
	};

	Just.prototype.foldl = Just.prototype.foldr = function(f, initial) {
		return f(initial, this._value);
	};

	Just.prototype.foldl1 = Just.prototype.foldr1 = function(f) {
		/*jshint unused:false*/
		return this._value;
	};

	Just.prototype.toString = Just.prototype.inspect = function() {
		return 'Just ' + this._value.toString();
	};

	Just.prototype.concat = function(maybe) {
		/*jshint unused:false*/
		// Semigroup/Monoid
		// See http://en.wikibooks.org/wiki/Haskell/MonadPlus#Definition
		return this;
	};

	Just.prototype.forEach = function(f) {
		f(this._value);
	};


	Just.prototype.traverse = function(_, f) {
		var of = this.constructor.of;
		return this._value.map(function(x) {
			return of(f(x));
		});
	};

	Nothing.prototype = Object.create(Maybe.prototype);

	var nothing = Maybe.nothing = new Nothing();

	Nothing.prototype.constructor = Nothing;

	function Nothing() {}

	Nothing.prototype.isNothing = function() {
		return true;
	};

	Nothing.prototype.isJust = function() {
		return !this.isNothing();
	};

	Nothing.prototype.getOrElse = function() {
		return void 0;
	};

	Nothing.prototype.foldl = Nothing.prototype.foldr = function(f, initial) {
		return initial;
	};

	Nothing.prototype.foldl1 = Nothing.prototype.foldr1 = function(f) {
		/*jshint unused:false*/
		return void 0;
	};

	Nothing.prototype.traverse = function(T, f) {
		/*jshint unused:false*/
		return this;
	};

	Nothing.prototype.toString = Nothing.prototype.inspect = function() {
		return 'Nothing';
	};

	Nothing.prototype.forEach = noop;

	Nothing.prototype.concat = identity;

	Nothing.prototype.filter = Nothing.prototype.map = Nothing.prototype.flatMap = Nothing.prototype.ap = function() {
		return this;
	};


	return Maybe;


	function noop() {}

	function identity(x) { return x; }

});
})(typeof define == 'function' && define.amd ? define : function (factory) { module.exports = factory(); }
);


