var most = require('most');

module.exports = function run() {
	var el = document.body;

	most.fromEvent('mousemove', document)
		.map(function(e) {
			return e.clientX + ',' + e.clientY;
		})
		.cons('move the mouse, please')
		.forEach(function(s) {
			el.innerHTML = s;
		});
};
