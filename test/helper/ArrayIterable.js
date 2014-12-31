var makeIterable = require('../../lib/iterable').makeIterable;

module.exports = ArrayIterable;

function Iteration(done, value) {
	this.done = done;
	this.value = value;
}

var DONE = Iteration.DONE = new Iteration(true, void 0);

function ArrayIterable(a) {
	this.array = a;
}

ArrayIterable.prototype = makeIterable(function() {
	return new ArrayIterator(this.array);
}, ArrayIterable.prototype);

function ArrayIterator(a) {
	this.array = a;
	this.index = 0;
	this.length = a.length >>> 0;
}

ArrayIterator.prototype.next = function() {
	var l = this.length;
	if(this.index < l) {
		var x = this.array[this.index];
		this.index += 1;
		return new Iteration(false, x);
	}

	return DONE;
};
