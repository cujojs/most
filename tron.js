// TODO: take, takeWhile, takeUntil, drop, dropWhile, takeUntil
// TODO: streams from iterable/iterator/generator
// TODO: move delay?

var Stream = require('./Stream');

module.exports = create;

create.of = Stream.of;
create.empty = Stream.empty;
create.fromArray = fromArray;
create.fromItem = fromItems;
create.fromEventTarget = fromEventTarget;
create.fromPromise = fromPromise;

function create(emitter) {
	return new Stream(emitter);
}

function fromArray(array) {
	return new Stream(function(next, end) {
		var error;
		try {
			array.forEach(function(x) {
				next(x);
			});
		} catch(e) {
			error = e;
		}

		end && end(error);
	});
}

function fromItems() {
	return fromArray(Array.prototype.slice.call(arguments));
}

function fromEventTarget(eventTarget, eventType) {
	return new Stream(function(next) {
		eventTarget.addEventListener(eventType, next, false);
	});
}

function fromPromise(promise) {
	return new Stream(function(next, end) {
		promise.then(next, end);
	});
}

Object.keys(Stream.prototype).reduce(function(exports, key) {
	if(!(key in exports)) {
		exports[key] = function() {
			var args = Array.prototype.slice.call(arguments);
			var stream = args.pop();
			return proto[key].apply(stream, args);
		};

		return exports;
	}
}, exports);
