//
// Behavior switching is a powerful aspect of streams.
// It allows a stream to behave like one stream, and then
// switch to behave like another, all without using shared
// variables or other mutable state.
//
// This demo implements drag and drop using behavior switching.
//
var most = require('most');

var DROP = 0, GRAB = 1, DRAG = 2;

module.exports = function() {
	// The thing we want to make draggable
	var draggable = document.querySelector('.draggable');

	// A higher-order stream (stream whose events are themselves streams)
	// A mousedown DOM event generates a stream event which is
	// a stream of 1 GRAB followed by DRAGS (ie mousemoves).
	var drag = most.fromEvent('mousedown', draggable)
		.map(function(e) {
			return most.fromEvent('mousemove', e.target)
				.map(function(e) {
					return eventToDragInfo(DRAG, e);
				})
				.startWith(eventToDragInfo(GRAB, e));
		});

	// A mouseup DOM event generates a stream event which is a
	// stream containing a DROP
	var drop = most.fromEvent('mouseup', draggable)
		.map(function(e) {
			return most.of(eventToDragInfo(DROP, e));
		});

	// Merge the drag and drop streams
	// Then use switch() to ensure that the resulting stream behaves
	// like the drag stream until an event occurs on the drop stream.  Then
	// it will behave like the drop stream until the drag stream starts
	// producing events again.
	// This effectively *toggles behavior* between dragging behavior and
	// dropped behavior.
	most.merge(drag, drop)
		.switch()
		.reduce(handleDrag, offset(draggable));
};

function offset(el) {
	return { dx: Math.floor(el.offsetWidth / 2), dy: Math.floor(el.offsetHeight / 2) };
}

function eventToDragInfo(action, e) {
	return { action: action, target: e.target, x: e.clientX, y: e.clientY };
}

function handleDrag(offset, dd) {
	var el = dd.target;

	if(dd.action === GRAB) {
		el.classList.add('dragging');
		return offset;
	}

	if(dd.action === DROP) {
		el.classList.remove('dragging');
	}

	var els = dd.target.style;
	els.left = (dd.x - offset.dx) + 'px';
	els.top = (dd.y - offset.dy) + 'px';

	return offset;
}
