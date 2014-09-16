var mostws = require('most/websocket');

module.exports = function() {
	var socket = new WebSocket('ws://localhost:8080');

	mostws.fromWebSocket(socket).forEach(console.log.bind(console));
	mostws.toWebSocket(most.periodic(1000), socket);

	setTimeout(socket.close.bind(socket), 5000);
};
