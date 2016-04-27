module.exports = Rule;

function Rule(matcher, compile) {
	this.matcher = matcher;
	this.compile = compile;
}

Rule.prototype.match = function(source) {
	return this.matcher.match(source);
};

function EmptyRule() {}

EmptyRule.prototype.match = function() {
	return true;
};

EmptyRule.prototype.compile = function(source) {
	return source;
};

Rule.empty = new EmptyRule();
