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

	function Maybe(value) {
		if(value === undefined || value === null) {
			return new Nothing();
		} else {
			return new Just(value);
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
			return Maybe.of(void 0);
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

	Maybe.prototype.reduce = function(f) {
		return arguments.length < 2 ? this.foldl1(f) : this.foldl(f, arguments[1]);
	};

	Maybe.prototype.reduceRight = function(f) {
		return arguments.length < 2 ? this.foldr1(f) : this.foldr(f, arguments[1]);
	};

	var just = Just.prototype = Object.create(Maybe.prototype);

	just.constructor = Just;

	function Just(value) {
		this._value = value;
	}

	just.isNothing = function() {
		return !this.isJust();
	};

	just.isJust = function() {
		return true;
	};

	just.getOrElse = function() {
		return this._value;
	};

	just.filter = function(predicate) {
		return predicate(this._value) ? this : Maybe.of(void 0);
	};

	just.map = function(f) {
		return Maybe.of(f(this._value));
	};

	just.flatMap = function(f) {
		return f(this._value);
	};

	just.ap = function(maybe) {
		return this.flatMap(function(f) {
			return maybe.map(f);
		});
	};

	just.foldl = just.foldr = function(f, initial) {
		return f(initial, this._value);
	};

	just.foldl1 = just.foldr1 = function(f) {
		/*jshint unused:false*/
		return this._value;
	};

	just.toString = just.inspect = function() {
		return 'Just ' + this._value.toString();
	};

	just.concat = function(maybe) {
		/*jshint unused:false*/
		// Semigroup/Monoid
		// See http://en.wikibooks.org/wiki/Haskell/MonadPlus#Definition
		return this;
	};

	just.forEach = function(f) {
		f(this._value);
	};

	var nothing = Nothing.prototype = Object.create(Maybe.prototype);

	nothing.constructor = Nothing;

	function Nothing() {}

	nothing.isNothing = function() {
		return true;
	};

	nothing.isJust = function() {
		return !this.isNothing();
	};

	nothing.getOrElse = function() {
		return void 0;
	};

	nothing.foldl = nothing.foldr = function(f, initial) {
		return initial;
	};

	nothing.foldl1 = nothing.foldr1 = function(f) {
		/*jshint unused:false*/
		return void 0;
	};

	nothing.toString = nothing.inspect = function() {
		return 'Nothing';
	};

	nothing.forEach = noop;

	nothing.concat = identity;

	nothing.filter = nothing.map = nothing.flatMap = nothing.ap = function() {
		return this;
	};

	return Maybe;


	function noop() {}

	function identity(x) { return x; }

});
})(typeof define == 'function' && define.amd ? define : function (factory) { module.exports = factory(); }
);


