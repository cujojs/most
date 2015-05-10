var most = require('most');

module.exports = function run() {
	// initial white noise
	var fuzz = createVideoStream(1, 7);
	// video stream from channel 1
	var channel1 = createVideoStream(11, 17);
	// video stream from channel 2
	var channel2 = createVideoStream(21, 27);

	// buttons click from remote controller, mapped over a video stream.
	var eChannel1 = most.fromEvent('click', document.getElementById('eb1')).constant(channel1);
	var eChannel2 = most.fromEvent('click', document.getElementById('eb2')).constant(channel2);

	var sel = most.of(fuzz).merge(eChannel1, eChannel2);
	var _screen = sel.switch();

	_screen.forEach(display(document.getElementById('screen')));
};

function display(el) {
	return function(x) {
		el.innerText = x;
	}
}

function createVideoStream(lo, hi) {
	var d = 1 + (hi - lo);
	return most.periodic(200).loop(function(x) {
		return { seed: x+1, value: lo + (x % d) };
	}, 0);
}