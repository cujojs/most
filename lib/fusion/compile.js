var Rule = require('./Rule');
var typeMatch = require('./typeMatch');
var compilers = require('./compilers');

module.exports = compile;

var rules = [
	new Rule(typeMatch.type2('Filter', 'Filter'), compilers.filterFilter),
	new Rule(typeMatch.type2('Map', 'Map'), compilers.mapMap),
	new Rule(typeMatch.type2('Filter', 'Map'), compilers.filterMap),
	new Rule(typeMatch.type2('Slice', 'Slice'), compilers.sliceSlice),
	new Rule(typeMatch.type2('Map', 'Slice'), compilers.mapSlice),
	new Rule(typeMatch.type('Merge'), compilers.merge)
];

function compile(source) {
	return compileSource(rules, source);
}

function compileSource(rules, source) {
	return findRule(rules, source).compile(source);
}

function findRule(rules, source) {
	for(var r, i=0; i<rules.length; ++i) {
		r = rules[i];
		if(r.match(source)) {
			return r;
		}
	}
	return Rule.empty
}
