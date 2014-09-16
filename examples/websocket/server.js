var ws = require('nodejs-websocket');

var server = ws.createServer(function (conn) {
	conn.on('text', function (message) {
		console.log('received', message);
	});

	var interval = setInterval(function() {
		conn.sendText(''+Date.now());
	}, 500);

	conn.on('close', function () {
		clearInterval(interval);
	});

	conn.on('error', function() {
		console.error(arguments);
		clearInterval(interval);
	});
}).listen(8080);