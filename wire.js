/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var most = require("./most");

var streamCreators = {
	periodic: function(options) {
		return most.periodic(options.period, options.value);
	},
	of: function(options) {
		return most.of(options.value);
	},
	fromPromise: function(options) {
		return most.fromPromise(options.promise);
	},
	from: function(options) {
		return most.from(options.iterable);
	},
	empty: function() {
		return most.empty();
	},
	never: function() {
		return most.never();
	},
	fromEvent: function(options) {
	    return most.fromEvent(options.event, options.source);
	},
	startWith: function(options) {
	    return most.startWith(options.first, options.inputStream);
	},
	concat: function(options) {
	    return most.concat(options.inputStream1, options.inputStream2);
	},
	cycle: function(options) {
	    return most.cycle(options.inputStream);
	},
	constant: function(options) {
		return most.constant(options.value, options.inputStream);
	},
	ap: function(options) {
		return most.ap(options.streamOfFunctions, options.inputStream);
	},
	timestamp: function(options) {
		return most.timestamp(options.inputStream);
	},
	distinct: function(options) {
		return most.distinct(options.inputStream);
	},
	slice: function(options) {
		return most.slice(options.start, options.end, options.inputStream);
	},
	take: function(options) {
		return most.take(options.n, options.inputStream);
	},
	skip: function(options) {
		return most.skip(options.n, options.inputStream);
	},
	until: function(options) {
		return most.until(options.endSignal, options.inputStream);
	},
	since: function(options) {
		return most.since(options.startSignal, options.inputStream);
	},
	merge: function(options) {
		return most.merge(options.inputStream1, options.inputStream2);
	},
	sampleWith: function(options) {
		return most.sampleWith(options.sampler, options.inputStream);
	},
	switch: function(options) {
		return most.switch(options.inputStream);
	},
	join: function(options) {
		return most.join(options.inputStream);
	},
	await: function(options) {
		return most.await(options.inputStream);
	},
	debounce: function(options) {
		return most.debounce(options.debounceTime, options.inputStream);
	},
	throttle: function(options) {
		return most.throttle(options.throttlePeriod, options.inputStream);
	},
	delay: function(options) {
		return most.delay(options.delayTime, options.inputStream);
	}
};

function createStream(resolver, options, wire, predicate, creatorOptionsRetriever) {
	wire(options).then(function(wiredOptions) {
		var creatorDef = findStreamCreator(wiredOptions, predicate);
		if (!creatorDef)
			throw new Error("Suitable stream creator not found.");
		return creatorDef.creator(creatorOptionsRetriever(creatorDef.name, wiredOptions));
	}).then(resolver.resolve, resolver.reject);
};

function findStreamCreator(wiredOptions, predicate) {
	var facName;
	for (facName in streamCreators) {
		if (predicate(facName, wiredOptions)) {
			return { name: facName, creator: streamCreators[facName] };
		}
	}
};

module.exports = function(options) {
	return {
		factories: {
			stream: function(resolver, componentDefinition, wire) {
				var options = componentDefinition.options;
				var type = options.type;
				createStream(resolver, options, wire, type != null ? fstEq(type) : hasKey, type != null ? snd : getKey, snd);
			}
		},
		resolvers: {
			stream: function(resolver, refName, refObj, wire) {
				delete refObj["$ref"];
				createStream(resolver, refObj, wire, fstEq(refName), snd);
			}
		}
	};
};

function snd(x, y) {
	return y;
};

function hasKey(key, obj) {
	return key in obj;
};

function getKey(key, obj) {
	return obj[key];
};

function fstEq(val) {
	return function(x, y) {
		return x === val;
	};
};
