var Id = require('./Id');
var _nothing = Object.create(Id.prototype);
var just = Id.of;

module.exports = maybe;

function maybe(x) {
	return isNothing(x) ? nothing() : just(x);
}

maybe.just = just;
maybe.nothing = nothing;
maybe.maybeT = maybeT;

function isNothing(x) {
	return x === void 0;
}

function nothing() {
	return _nothing;
}

_nothing.map = _nothing.flatMap = _nothing.ap = function() {
	return this;
};

_nothing.toString = _nothing.inspect = function() {
	return 'Nothing';
};

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