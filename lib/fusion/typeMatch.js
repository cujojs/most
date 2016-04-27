exports.type2 = function(t1, t2) {
	return new TypeMatch2(t1, t2);
}

exports.type = function(t) {
	return new TypeMatch(t);
}

function TypeMatch2(t1, t2) {
	this.t1 = t1;
	this.t2 = t2;
}

TypeMatch2.prototype.match = function(source) {
	var prev = source.source;
	return prev
		&& prev.constructor.name === this.t1
		&& source.constructor.name === this.t2;
};

function TypeMatch(t) {
	this.t = t;
}

TypeMatch.prototype.match = function(source) {
	return source.constructor.name === this.t;
};
