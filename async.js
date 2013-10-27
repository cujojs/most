var handlerQueue = [];

module.exports = enqueue;

function enqueue(task) {
	if(handlerQueue.push(task) === 1) {
		nextTick(drainQueue);
	}
}

function drainQueue() {
	var task, i = 0, queue = handlerQueue;

	handlerQueue = [];
	while(task = queue[i++]) {
		task();
	}
}

// Sniff "best" async scheduling option
/*global process,window,document,setImmediate*/
if (typeof process === 'object' && process.nextTick) {
	nextTick = typeof setImmediate === 'function' ? setImmediate : process.nextTick;
} else if(typeof window !== 'undefined' && (MutationObserver = window.MutationObserver || window.WebKitMutationObserver)) {
	nextTick = (function(document, MutationObserver, drainQueue) {
		var el = document.createElement('div');
		new MutationObserver(drainQueue).observe(el, { attributes: true });

		return function() {
			el.setAttribute('x', 'x');
		};
	}(document, MutationObserver, drainQueue));
} else {
	nextTick = function(t) { setTimeout(t, 0); };
}