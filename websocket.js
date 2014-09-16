/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var create = require('./lib/source/create');
var fromPromise = require('./lib/Stream').fromPromise;
var promise = require('./lib/promises').create;

exports.fromWebSocket = fromWebSocket;
exports.toWebSocket = toWebSocket;

function fromWebSocket(ws) {
	return create(function(add, end, error) {
		pipeFromWebSocket(ws, add, end, error);
	});
}

function pipeFromWebSocket(ws, add, end, error) {
	ws.addEventListener('open', onOpen);

	function onOpen() {
		ws.addEventListener('close', end);
		ws.addEventListener('error', error);
		ws.addEventListener('message', add);
	}

	return function() {
		ws.removeEventListener('close', end);
		ws.removeEventListener('error', error);
		ws.removeEventListener('message', add);
	};
}

function toWebSocket(stream, ws) {
	return promise(function(resolve) {
		pipeToWebSocket(stream, ws, resolve);
	});
}

function pipeToWebSocket(stream, ws, resolve) {
	ws.addEventListener('open', function onOpen() {
		initToWebSocket(stream, ws, resolve);
	});
}

function initToWebSocket(stream, ws, resolve) {
	var endSignal = fromPromise(promise(function(resolve, reject) {
		ws.addEventListener('close', resolve);
		ws.addEventListener('error', reject);
	}));

	var result = stream.takeUntil(endSignal).forEach(function (x) {
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(x);
		}
	});

	resolve(result);
}