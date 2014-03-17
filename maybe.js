var Id = require('./Id');
var _nothing;

module.exports = Maybe;

Maybe.maybe = maybe;
maybe.just = Maybe.of = just;
maybe.nothing = nothing;
maybe.maybeT = maybeT;

// Maybe (Just)

function Maybe(x) {
	Id.call(this, x);
}

Maybe.prototype = Object.create(Id.prototype);

Maybe.prototype.toString = Maybe.prototype.inspect = function() {
	return 'Just ' + String(this._value);
};

function maybe(x) {
	return isNothing(x) ? nothing() : just(x);
}

function just(x) {
	return new Maybe(x);
}

// Nothing

_nothing = Object.create(Maybe.prototype);

_nothing.map = _nothing.flatMap = _nothing.ap = function() {
	return this;
};

_nothing.toString = _nothing.inspect = function() {
	return 'Nothing';
};

function nothing() {
	return _nothing;
}

function isNothing(x) {
	return x === void 0;
}

// maybeT

function maybeT(M) {
	function MaybeT(x) {
		this.value = x;
	}

	MaybeT.of = of;

	function of(x) {
		return new MaybeT(M.of(just(x)));
	}

	MaybeT.prototype.flatMap = function(f) {
		var m = this.value;
		return new MaybeT(m.flatMap(function(maybe) {
			return M.of(maybe.flatMap(f));
		}));
	};

	MaybeT.prototype.map = function(f) {
		return this.flatMap(function(x) {
			return just(f(x));
		});
	};

	MaybeT.prototype.ap = function(x) {
		return this.flatMap(function(f) {
			return x.map(f);
		});
	};

	MaybeT.prototype.toString = function() {
		return this.value.toString();
	};

	MaybeT.prototype.inspect = function() {
		return this.value.inspect();
	};

	return MaybeT;
}