exports.fromReadable = fromReadable;
exports.toWritable = toWritable;

function fromReadable(readable) {
	return function(next, end) {
		readable.on('data', next).on('end', end).on('close', end).on('error', end);
	}
}

function toWritable(writable, stream) {
	stream(function(x) {
		writable.write(x);
	}, noop);

	return writable;
}

function noop() {}
