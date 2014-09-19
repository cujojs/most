//
// Behavior switching is a powerful aspect of streams.
// It allows a stream to behave like one stream, and then
// switch to behave like another, all without using shared
// variables or other mutable state.
//
// This demo implements drag and drop using behavior switching.
//
var most = require('most');

module.exports = function() {
	var draggable = document.querySelector('.draggable');
	var drag = most.fromEvent('mousedown', draggable)
		.map(function(e) {
			return most.of(eventToDragInfo(1, e)).merge(
			most.fromEvent('mousemove', e.target).map(function(e) {
				return eventToDragInfo(2, e);
			}));
		});

	var drop = most.fromEvent('mouseup', draggable)
		.map(function(e) {
			return most.of(eventToDragInfo(0, e));
		});

	most.merge(drag, drop)
		.switch()
		.reduce(handleDrag, offset(draggable));
};

function offset(el) {
	return { dx: Math.floor(el.offsetWidth / 2), dy: Math.floor(el.offsetHeight / 2) };
}

function eventToDragInfo(drop, e) {
	return { drop: drop, target: e.target, x: e.clientX, y: e.clientY };
}

function handleDrag(offset, dd) {
	var el = dd.target;

	if(dd.drop === 1) {
		el.classList.add('dragging');
		return offset;
	}

	if(dd.drop === 0) {
		el.classList.remove('dragging');
	}

	var els = dd.target.style;
	els.left = (dd.x - offset.dx) + 'px';
	els.top = (dd.y - offset.dy) + 'px';

	return offset;
}
