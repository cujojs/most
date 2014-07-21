[![Build Status](https://travis-ci.org/cujojs/most.svg?branch=master)](https://travis-ci.org/cujojs/most)

# Monadic Stream

Most.js is toolkit for composing asynchronous operations on streams of data and values that vary over time, without many of the hazards of mutable shared state.  It provides a powerful set of observable streams, and operations for merging, filtering, transforming, and reducing them.

## What can it do?

*Examples coming soon*

## Why use it?

*Coming soon*

### What about Promises?

Promises are another elegant and powerful data structure for managing asynchronous values.  Promises and observable streams are clearly related in that they provide tools for managing asynchrony.  However, they each have their strengths.

Promises deal with single, asynchronous, immutable values and provide operations for transforming them, and providing asynchronous error handling and flow control.  Observable streams deal with *sequences of asynchronous values*, and as such, provide a similar but typically broader set of operations.

Most.js interoperates seamlessly with ES6 and Promises/A+ promises.  In fact, it even uses promises internally.  For example, reducing a stream returns a promise for the final result:

```js
// After 4 seconds, logs 10
most.from([1, 2, 3, 4])
	.delay(1000)
	.reduce(function(result, y) {
		return result + y;
	}, 0)
	.then(function(result) {
		console.log(result);
	});
```

You can also create a stream from a promise:

```js
// Logs "hello"
most.fromPromise(Promise.resolve('hello'))
	.observe(function(message) {
		console.log(message);
	});
```
