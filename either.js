var Id = require('./Id');

module.exports = {
	right: right,
	left: left,
	eitherT: eitherT
};

function Right(x) {
	Id.call(this, x);
}

Right.of = right;

function right(x) {
	return new Right(x);
}

Right.prototype = Object.create(Id.prototype);

Right.prototype.toString = Right.prototype.inspect = function() {
	return 'Right ' + String(this._value);
};

function Left(x) {
	this._value = x;
}

Left.of = left;

function left(x) {
	return new Left(x);
}

Left.prototype.flatMap = Left.prototype.map = Left.prototype.ap = function() {
	return left(this._value);
};

Left.prototype.toString = Left.prototype.inspect = function() {
	return 'Left ' + String(this._value);
};

function eitherT(M) {
	function EitherT(x) {
		this.value = x;
	}

	EitherT.of = of;

	function of(x) {
		return new EitherT(M.of(right(x)));
	}

	EitherT.prototype.flatMap = function(f) {
		var m = this.value;
		return new EitherT(m.flatMap(function(either) {
			return M.of(either.flatMap(f));
		}));
	};

	EitherT.prototype.map = function(f) {
		return this.flatMap(function(x) {
			return right(f(x));
		});
	};

	EitherT.prototype.ap = function(x) {
		return this.flatMap(function(f) {
			return x.map(f);
		});
	};

	EitherT.prototype.toString = function() {
		return this.value.toString();
	};

	EitherT.prototype.inspect = function() {
		return this.value.inspect();
	};

	return EitherT;

}