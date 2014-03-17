module.exports = Id;

function Id(x) {
	this._value = x;
}

Id.of = function(x) {
	return new Id(x);
};

Id.prototype.map = function(f) {
	return this.constructor.of(f(this._value));
};

Id.prototype.flatMap = function(f) {
	return f(this._value);
};

Id.prototype.ap = function(x) {
	return this.flatMap(function(f) {
		return x.map(f);
	});
};

Id.prototype.toString = Id.prototype.inspect = function() {
	return 'Id ' + String(this._value);
};