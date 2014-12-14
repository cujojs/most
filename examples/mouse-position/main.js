var most = require('most');

module.exports = function run() {
	// Turn mouse events into "x,y"
	// Insert an initial string at the beginning of the stream, to
	//   display a message *before* the first mousemove
	// Render each string
	most.fromEvent('mousemove', document)
		.map(function(e) {
			return e.clientX + ',' + e.clientY;
		})
		.startWith('move the mouse, please')
		.observe(function(s) {
			document.body.textContent = s;
		});
};
