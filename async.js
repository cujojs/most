module.exports = enqueue;

var nextTick, MutOb, handlerQueue = [];

function enqueue(task) {
	if(handlerQueue.push(task) === 1) {
		nextTick(drainQueue);
	}
}

function drainQueue() {
	var i, len, queue = handlerQueue;

	handlerQueue = [];
	for(i=0, len=queue.length; i<len; i++) {
		queue[i]();
	}
}

// Sniff "best" async scheduling option
/*global process,window,document,setImmediate*/
if (typeof process === 'object' && process.nextTick) {
	nextTick = typeof setImmediate === 'function' ? setImmediate : process.nextTick;
} else if(typeof window !== 'undefined' && (MutOb = window.MutationObserver || window.WebKitMutationObserver)) {
	nextTick = (function(document, MutationObserver, drainQueue) {
		var el = document.createElement('div');
		new MutationObserver(drainQueue).observe(el, { attributes: true });

		return function() {
			el.setAttribute('x', 'x');
		};
	}(document, MutOb, drainQueue));
} else {
	nextTick = function(t) { setTimeout(t, 0); };
}