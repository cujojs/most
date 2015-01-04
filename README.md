[![Build Status](https://travis-ci.org/cujojs/most.svg?branch=master)](https://travis-ci.org/cujojs/most)

# Monadic streams for reactive programming

Most.js is a toolkit for reactive programming.  It helps you compose asynchronous operations on streams of values and events, e.g. WebSocket messages, DOM events, etc, and on time-varying values, e.g. the "current value" of an &lt;input&gt;, without many of the hazards of side effects and mutable shared state.

It features an ultra-high performance, low overhead architecture, APIs for easily creating event streams from existing sources, like DOM events, and a small but powerful set of operations for merging, filtering, transforming, and reducing event streams and time-varying values.

## Learn more

* [API docs](docs/api.md)
* [Examples](examples)
* [Get it](#get-it)

## Simple example

Here's a simple program that displays the result of adding two inputs.  The result is reactive and updates whenever *either* input changes.

First, the HTML fragment for the inputs and a place to display the live result:

```html
<form>
	<input class="x"> + <input class="y"> = <span class="result"></span>
</form>
```

Using most.js to make it reactive:

```js
var most = require('most');

var xInput = document.querySelector('input.x');
var yInput = document.querySelector('input.y');
var resultNode = document.querySelector('.result');

exports.main = function() {
	// x represents the current value of xInput
	var x = most.fromEvent('input', xInput).map(toNumber);

	// y represents the current value of yInput
	var y = most.fromEvent('input', yInput).map(toNumber);

	// result is the live current value of adding x and y
	var result = most.combine(add, x, y);

	// Observe the result value by rendering it to the resultNode
	result.observe(renderResult);
};

function add(x, y) {
	return x + y;
}

function toNumber(e) {
	return Number(e.target.value);
}

function renderResult(result) {
	resultNode.textContent = result;
}
```

## More examples

To [run the example above](examples/add-inputs) and [others](examples) using [RaveJS](https://github.com/RaveJS/rave): clone the repo into a web servable dir, `cd examples/<name> && bower install`, and load `index.html` in your browser.

## Get it

`npm install --save most` or `bower install --save most`

then

```js
var most = require('most');
```

## Iteroperability

<a href="http://promises-aplus.github.com/promises-spec"><img width="82" height="82" alt="Promises/A+" src="http://promises-aplus.github.com/promises-spec/assets/logo-small.png"></a>
<a href="https://github.com/fantasyland/fantasy-land"><img width="82" height="82" alt="Fantasy Land" src="https://raw.github.com/puffnfresh/fantasy-land/master/logo.png"></a>

Most.js streams are [compatible with Promises/A+ and ES6 Promises](promises).  They also implement [Fantasy Land](https://github.com/fantasyland/fantasy-land) `Monoid`, `Functor`, `Applicative`, and `Monad`.

## But what about

### Promises?

Promises are another elegant and powerful data structure for composing asynchronous operations.  Promises and reactive streams are clearly related in that they provide tools for managing asynchrony.  However, they each have their strengths.

Promises deal with single, asynchronous, immutable values and provide operations for transforming them, and provide asynchronous error handling and flow control.  Event streams represent sequences of asynchronous values or values that vary over time.  They provide a similar, but typically broader, set of operations.

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
