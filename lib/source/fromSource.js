var Stream = require('../Stream');
var iterable = require('../iterable');

var getIterator = iterable.getIterator;

module.exports = fromSource;

function fromSource(source) {
	return new Stream(queueNext, source, source.scheduler, queueDispose);
}

function queueNext(queue) {
	return getIterator(queue).next();
}

function queueDispose(t, x, queue) {
	console.log(queue);
	return queue.dispose(t, x);
}