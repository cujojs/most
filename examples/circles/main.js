var most = require('most');

// Make some circles fly around the window, following the mouse
// at various delay intervals.
module.exports = function run() {

	var circle = document.querySelector('.circle');
	var transformProp = sniffTransformStyleProp(circle);
	var s = window.getComputedStyle(circle);
	var w = parseInt(s.width, 10)/2;
	var h = parseInt(s.height, 10)/2;

	// Number of mouse tails (circles) to create
	var nTails = 20;

	// Stream mouse movements and turn them into translate3d style rules
	var mousemoves = most.fromEvent('mousemove', document).map(toTranslate3d);

	// create an infinite stream of delay times: 0,100,200,300,400...etc
	// We'll limit this with take() later
	var delays = most.iterate(function (x) { return x + 100; }, 0);

	// Create an infinite stream of random colors
	var colors = most.iterate(colorGenerator, colorGenerator());

	// For each delay,color pair, create a tail and start translating it
	// Limit the number of tails to nTails
	// Merge the flurry of circles into one stream and start observing it
	// so that it will actually run (streams are lazy: when not observing
	// then, they are inert!)
	most.zipWith(makeDelayedTail, delays, colors)
		.take(nTails)
		.mergeAll()
		.forEach(noop);

	// Move a circle by setting its css transform to the provided translate3d
	function translate(tx, circle) {
		circle.style[transformProp] = tx;
		return circle;
	}

	// Create a tail whose movements will be delayed by the provided delay
	// and whose color will be the provided color
	function makeDelayedTail(delay, color) {
		var tail = makeTail(circle, color);
		return mousemoves.delay(delay).zipWith(translate, most.repeat(tail));
	}

	// Turn a mouse event into a css translate3d string
	function toTranslate3d(e) {
		return 'translate3d(' + (e.clientX-w) + 'px' + ',' + (e.clientY-h) + 'px' + ',0)';
	}
};

// Clone the circle to make a new one and set its color
function makeTail(circle, color) {
	var tail = circle.cloneNode(false);
	tail.style.backgroundColor = color;
	circle.parentNode.appendChild(tail);
	return tail;
}

// Generate a random color
function colorGenerator() {
	return 'hsl(' + randInt(0, 360) + ',' + randInt(20, 80) + '%,' + randInt(20, 80) + '%)';
}

// Generate a random int between low and high
function randInt(low, high) {
	return Math.floor(Math.random() * (high - low)) + low;
}

// Sniff for the particular css transform property we need to use
function sniffTransformStyleProp (circle) {
	return 'webkitTransform' in circle.style ? 'webkitTransform'
		 : 'mozTransform' in circle.style ? 'mozTransform'
		 : 'msTransform' in circle.style ? 'msTransform'
		 : 'transform';
}

// Log stuff to the console if you want to see the *firehose*
function noop(x) {
	//console.log(x);
}
