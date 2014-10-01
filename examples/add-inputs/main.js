var most = require('most');

var xInput = document.querySelector('input.x');
var yInput = document.querySelector('input.y');
var resultNode = document.querySelector('.result');

module.exports = function() {
	// Create "signals" (aka time-varying values) representing
	// the x and y <input>s' current values
	var x = signalFromInput(xInput).map(Number);
	var y = signalFromInput(yInput).map(Number);

	// Add the two signals in to produce a new signal that
	// changes whenever either input changes
	var result = most.combine(add, x, y);

	// observe the result over time, ie render it in the UI
	result.observe(setText(resultNode));
};

function add(x, y) {
	return x + y;
}

function setText(node) {
	return function(text) {
		node.textContent = text;
	};
}

function signalFromInput(input) {
	return most.fromEvent('input', input).map(toValue).startWith(input.value);
}

function toValue(e) {
	console.log(e);
	return e.target.value;
}
