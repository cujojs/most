[![Build Status](https://travis-ci.org/cujojs/most.svg?branch=master)](https://travis-ci.org/cujojs/most)

# Monadic streams for reactive programming

[![Join the chat at https://gitter.im/cujojs/most](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/cujojs/most?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Most.js is a toolkit for reactive programming.  It helps you compose asynchronous operations on streams of values and events, e.g. WebSocket messages, DOM events, etc, and on time-varying values, e.g. the "current value" of an &lt;input&gt;, without many of the hazards of side effects and mutable shared state.

It features an ultra-high performance, low overhead architecture, APIs for easily creating event streams from existing sources, like DOM events, and a small but powerful set of operations for merging, filtering, transforming, and reducing event streams and time-varying values.

## Learn more

* [API docs](docs/api.md)
* [Recipes](docs/recipes)
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

As a module:

```
npm install --save most` or `bower install --save most
```

```js
var most = require('most');
```

As `window.most`:

```
bower install --save most`
```

```html
<script src="most/dist/most.js"></script>
```

## Iteroperability

<a href="http://promises-aplus.github.com/promises-spec"><img width="82" height="82" alt="Promises/A+" src="http://promises-aplus.github.com/promises-spec/assets/logo-small.png"></a>
<a href="https://github.com/fantasyland/fantasy-land"><img width="82" height="82" alt="Fantasy Land" src="https://raw.github.com/puffnfresh/fantasy-land/master/logo.png"></a>

Most.js streams are [compatible with Promises/A+ and ES6 Promises](promises).  They also implement [Fantasy Land](https://github.com/fantasyland/fantasy-land) `Monoid`, `Functor`, `Applicative`, and `Monad`.

## Reactive Programming

[Reactive programming](docs/concepts.md) is an important concept that provides a lot of advantages: it naturally handles asynchrony and provides a model for dealing with complex data and time flow while also lessening the need to resort to shared mutable state. It has many applications: interactive UIs and animation, client-server communication, robotics, IoT, sensor networks, etc.

## Why most.js for Reactive Programming?

### High performance

A primary focus of most.js is performance.  The [perf test results](test/perf) indicate that it is achieving its goals in this area. Our hope is that by publishing those numbers, and showing what is possible, other libs will improve as well. 

### Modular architecture

Most.js is highly modularized. It's internal Stream/Source/Sink architecture and APIs are simple, concise, and well defined. Combinators are implemented entirely in terms of that API, and don't need to use any private details. This makes it easy to implement new combinators externally (ie in contrib repos, for example) while also guaranteeing they can still be high performance.

### Simplicity

Aside from making combinators less "obviously correct", complexity can also lead to performace and maintainability issues. We felt a simple implementation would lead to a more stable and performant lib overall.

### Integration

Most.js integrates with language features, such as promises, iterators, generators, and *asynchronous* generators.

#### Promises

Promises are a natural compliment to asynchronous reactive streams. The relationship between synchronous "sequence" and "value" is clear, and the asynchronous analogue needs to be clear, too. By taking the notion of a sequence and a value and lifting them into the asynchronous world, it seems clear that reducing an asynchronous sequence should produce a promise. Hence, most.js uses promises when a single value is the natural synchronous analogue.

Most.js interoperates seamlessly with ES6 and Promises/A+ promises.  For example, reducing a stream returns a promise for the final result:

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

#### Generators

Conceptually, [generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) allow you to write a function that acts like an iterable sequence.  Generators support the standard ES6 [Iterator interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/The_Iterator_protocol), so they can be iterated over using ES6 standard `for of` or the iterator's `next()` API.

Most.js interoperates with ES6 generators and iterators.  For example, you can create an event stream from any ES6 iterable:

```js
function* allTheIntegers() {
	let i=0;
	while(true) {
		yield i++;
	}
}

// Log the first 100 integers
most.from(allTheIntegers())
	.take(100)
	.observe(x => console.log(x));
```

#### Asynchronous Generators

You can also create an event stream from an *asynchronous generator*, a generator that yields promises:

```js
function* allTheIntegers(interval) {
	let i=0;
	while(true) {
		yield delayPromise(interval, i++);
	}
}

function delayPromise(ms, value) {
	return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

// Log the first 100 integers, at 1 second intervals
most.generate(allTheIntegers, 1000)
	.take(100)
	.observe(x => console.log(x));
```
