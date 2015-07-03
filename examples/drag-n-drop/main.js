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
	// The area where we want to do the dragging
	var area = document.querySelector('.dragging-area');
	// The thing we want to make draggable
	var draggable = document.querySelector('.draggable');

	// A higher-order stream (stream whose items are themselves streams)
	// A mousedown DOM event generates a stream event which is
	// a stream of 1 GRAB followed by DRAGs (ie mousemoves).
	var drag = most.fromEvent('mousedown', draggable)
		.map(function(e) {
			// On Firefox, avoid the dragging to select text
			e.preventDefault();

			// Memorize click position within the box
			var dragOffset = {
				dx: e.clientX - draggable.offsetLeft,
				dy: e.clientY - draggable.offsetTop
			};

			return most.fromEvent('mousemove', area)
				.map(function(e) {
					return eventToDragInfo(DRAG, draggable, e, dragOffset);
				})
				.startWith(eventToDragInfo(GRAB, draggable, e));
		});

	// A mouseup DOM event generates a stream event which is a
	// stream containing a DROP.
	var drop = most.fromEvent('mouseup', area)
		.map(function(e) {
			return most.of(eventToDragInfo(DROP, draggable, e));
		});

	// Merge the drag and drop streams.
	// Then use switch() to ensure that the resulting stream behaves
	// like the drag stream until an event occurs on the drop stream.  Then
	// it will behave like the drop stream until the drag stream starts
	// producing events again.
	// This effectively *toggles behavior* between dragging behavior and
	// dropped behavior.
	most.merge(drag, drop)
		.switch()
		.observe(handleDrag);
};

// dragOffset is undefined and unused for actions other than DRAG.
function eventToDragInfo(action, target, e, dragOffset) {
	return { action: action, target: target, x: e.clientX, y: e.clientY, offset: dragOffset };
}

function handleDrag(dragInfo) {
	var el = dragInfo.target;

	if (dragInfo.action === GRAB) {
		el.classList.add('dragging');
		return;
	}

	if (dragInfo.action === DROP) {
		el.classList.remove('dragging');
		return;
	}

	var els = dragInfo.target.style;
	els.left = (dragInfo.x - dragInfo.offset.dx) + 'px';
	els.top = (dragInfo.y - dragInfo.offset.dy) + 'px';
}
