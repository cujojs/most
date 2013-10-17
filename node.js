/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Brian Cavalier
 * @author: John Hann
 */

var Stream = require('./Stream');

exports.fromReadable = fromReadable;
exports.toWritable = toWritable;

function fromReadable(readable) {
	return new Stream(function(next, end) {
		readable.on('data', next)
			.on('end', end).on('close', end).on('error', end);
	});
}

function toWritable(writable, stream) {
	stream.each(function(x) {
		writable.write(x);
	}, noop);

	return writable;
}

function noop() {}
