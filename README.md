[![Build Status](https://travis-ci.org/cujojs/most.svg?branch=master)](https://travis-ci.org/cujojs/most)

# Monadic Stream

Most.js is a toolkit for composing asynchronous operations on streams of data and values that vary over time, without many of the hazards of mutable shared state.  It provides a powerful set of observable streams and operations for merging, filtering, transforming, and reducing them.

## What can it do?

*Examples coming soon*

## Why use it?

*Coming soon*

## But what about

### Promises?

Promises are another elegant and powerful data structure for composing asynchronous operations.  Promises and observable streams are clearly related in that they provide tools for managing asynchrony.  However, they each have their strengths.

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

### Generators

Conceptually, [generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) allow you to write a function that acts like an iterable sequence.  Generators support the standard ES6 [Iterator interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/The_Iterator_protocol), so they can be iterated over using ES6 standard `for of` or the iterator's `next()` API.

Most.js interoperates with ES6 generators and iterators.  For example, you can create an observable stream from any ES6 iterable:

```js
function* allTheIntegers() {
	var i=0;
	while(true) {
		yield i++;
	}
}

// Log the first 100 integers
most.from(allTheIntegers())
	.take(100)
	.observe(function(x) {
		console.log(x);
	});
```
