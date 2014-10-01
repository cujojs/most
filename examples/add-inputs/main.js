var most = require('most');

// Display the result of adding two inputs.
// The result is reactive and updates whenever *either* input changes.

var xInput = document.querySelector('input.x');
var yInput = document.querySelector('input.y');
var resultNode = document.querySelector('.result');

exports.main = function() {
	// x represents the current value of xInput
	var x = most.fromEvent('input', xInput).map(toNumber);

	// x represents the current value of yInput
	var y = most.fromEvent('input', yInput).map(toNumber);

	// result is the live current value of adding x and y
	var result = most.combine(add, x, y);

	// Observe the result value by rendering it to the resultNode
	result.observe(renderResult);
};

function add(x, y) {
	return x + y;
}

function toNumber(e) {
	return Number(e.target.value);
}

function renderResult(result) {
	resultNode.textContent = result;
}