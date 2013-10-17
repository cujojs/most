var Stream = require('./Stream');

exports.fromReadable = fromReadable;
exports.toWritable = toWritable;

function fromReadable(readable) {
	return new Stream(function(next, end) {
		readable
			.on('data', next)
			.on('end', end)
			.on('close', end)
			.on('error', end);
	});
}

function toWritable(writable, stream) {
	stream.each(function(x) {
		writable.write(x);
	}, noop);

	return writable;
}

function noop() {}
