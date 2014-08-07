var Stream = require('../Stream');
var iterable = require('../iterable');
var iterableHead = iterable.head;

module.exports = fromSource;

function fromSource(source) {
	return new Stream(iterableHead, source);
}