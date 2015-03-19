# Table of contents

1. Introduction
1. [`stream` wire plugin](#module-most-wire)
	1. [`stream` Factory](#wire-stream-factory)
	1. [`stream` resolver](#wire-stream-resolver)
1. [`stream` components creation API](#stream-components-creation-api)

# wire.js

[wire.js](https://github.com/cujojs/wire/) is an Inversion of Control container that allows applications to be composed together at runtime based on a declarative configuration. A rest.js plugin is provided for wire.js that enables declarative configuration of rest.js clients, including chaning interceptors with their configuration.

<a name="module-most-wire"></a>
## `stream` Wire Plugin

You can find `most/wire` plugin sources here: ([src](../wire.js))

**TIP:** In each of these examples, `{ module: 'most/wire' }` is loaded as a wire plugin as it provides the `stream` factory to the wire.js spec.  Without this module being loaded into the spec, the facilities below will silently fail.

There are three ways to use this wire.js plugin to create stream components:

* [`stream` factory](#wire-stream-factory)
	* [`stream` factory using sub-factory](#wire-stream-factory-subfactory)
	* [`stream` factory using `type` key](#wire-stream-factory-type)
* [`stream` resolver](#wire-stream-resolver)

<a name="wire-stream-factory"></a>
### `stream` Factory

The `stream` factory provides a declarative way to define a stream.

<a name="wire-stream-factory-subfactory"></a>
#### `stream` factory using sub-factory

```js
myPeriodicStream: {
	stream: {
		periodic: {
			period: 500,
			value: "x"
		}
	}
}
```

<a name="wire-stream-factory-type"></a>
#### `stream` factory using `type` key

```js
myPeriodicStream: {
	stream: {
		type: "periodic",
		period: 700,
		value: "z"
	}
}
```

<a name="wire-stream-resolver"></a>
### `stream` Resolver

The `stream` resolver provides a way to acquire a stream using `{ $ref: "stream!stream_type" }` notation. It is especially useful to get a reference to streams that do not have configuration parameters (e.g. `{ $ref: "stream!empty"}`).

```js
periodicRef: { $ref: "stream!periodic", period: 300, value: "y" }

anotherComponent: {
	create: {
		module: "myApp/componentA",
		args: [ { $ref: "stream!never" } ]
	}
}
```

<a name="stream-components-creation-api"></a>
## `stream` Components Creation API

Stream components can be created using three methonds mentioned above.  However, despite the method in use the stream types and creation parameters remain the same.  Examples below consistently use one of the methods.

### Creating streams

Below you can find stream creators object.  Keys in this object match sub-key name, `type` and refName in the three creation methods respectively.

```js
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
	}
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
``` 
