API
===

1. Creating streams
	* [most.of](#mostof)
	* [most.from](#mostfrom)
	* [most.fromPromise](#mostfrompromise)
	* [most.periodic](#mostperiodic)
	* [most.empty](#mostempty)
	* [most.never](#mostnever)
1. Adapting to other event sources
	* [most.fromEvent](#mostfromevent)
	* [most.fromEventWhere](#mostfromeventwhere)
	* [most.create](#mostcreate)
1. Building streams
	* most.iterate
	* most.unfold
	* most.repeat
1. Handling stream errors
	* flatMapError
1. Generating errors
	* throwError
1. Extending streams
	* startWith
	* cons
	* concat
	* cycle
1. Merging streams
	* merge
	* mergeArray
	* mergeAll
1. Zipping streams
	* zip
	* zipWith
	* zipArray
	* zipArrayWith
1. Behavior switching
	* switch
1. Transforming streams
	* map
	* ap
	* flatMap
	* scan
	* tap
1. Filtering streams
	* filter
	* take
	* takeWhile
	* distinct
	* distinctBy
1. Reducing streams
	* reduce
1. Rate limiting streams
	* debounce
	* delay
	* throttle

### Notation

You'll see various diagrams like the following:

```
stream1: -a-b-c-d->

stream2: -a--b---c|

stream3: -abc-def-X
```

These are timeline diagrams that try to give a simple, representative notion of how a stream behaves over time.  Time proceeds from left to right, using letters and symbols to indicate certain things:

* `-` - an instant in time where no event occurs
* letters (a,b,c,d,etc) - an event at an instant in time
* `|` - end of stream
* `X` - an error occurred at an instant in time
* `>` - stream continues infinitely
	* Typically, `>` means you can assume that a stream will continue to repeat some common pattern infinitely

#### Examples

`stream: a|`

A stream that emits `a` and then ends immediately.

`stream: a-b---|`

A stream that emits `a`, then `b`, and some time later ends.

`stream: a-b-X`

A stream that emits `a`, then `b`, then fails.

`stream: abc-def->`

A stream that emits `a`, then `b`, then `c`, then nothing, then `d`, then `e`, then `f`, and then continues infinitely.

## Creating streams

<a name="mostof" />
### most.of(x) -> Stream

```
most.of(x): x|
```

Create a stream containing only x.

```js
var stream = most.of('hello');
stream.forEach(console.log.bind(console)); // logs hello
```

<a name="mostfrom"/>
### most.from(iterable) -> Stream

```
most.from([1,2,3,4]): 1234|
```

Create a stream containing all items from an iterable.  The iterable can be an Array, Array-like, or anything that supports the [iterable protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/iterable) or [iterator protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/The_Iterator_protocol), such as a [generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*). Providing a finite iterable, such as an Array, creates a finite stream. Providing an infinite iterable, such as an infinite generator, creates an infinite stream.

```js
// Log 1 2 3 4
most.from([1,2,3,4])
	.forEach(console.log.bind(console));
```

```js
function* numbers() {
	for(i=0 ;; ++i) {
		yield i;
	}
}

// Create an infinite stream of numbers
var stream = most.from(numbers());

// Limit the stream to the first 100 numbers
stream.take(100)
	.forEach(console.log.bind(console));
```

<a name="mostfrompromise"/>
### most.fromPromise(promise) -> Stream

```
promise:                   ----a
most.fromPromise(promise): ----a|
```

Create a stream containing the outcome of a promise.  If the promise fulfills, the stream will contain the promise's value.  If the promise rejects, the stream will be in an error state with the promise's rejection reason as its error.  See [flatMapError](#flatmaperror) for error recovery.

<a name="mostperiodic"/>
### most.periodic(period) -> Stream

```
most.periodic(2): a-b-c-d-e-f->
most.periodic(5): a----b----c->
```

Create an infinite stream containing events that arrive every `interval` milliseconds. The value of each event is its arrival time in milliseconds.

<a name="mostempty"/>
### most.empty() -> Stream

```
most.empty(): |
```

Create an already-ended stream containing no events.

<a name="mostnever"/>
### most.never() -> Stream

```
most.never(): ---->
```

Create a stream that contains no events and never ends.

## Adapting to other event sources

<a name="mostfromevent"/>
### most.fromEvent(eventType, source) -> Stream

```
source:                            -a--b-c---d->
most.fromEvent(eventType, source): -a--b-c---d->
```

Create a stream containing events from the provided [EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget), such as a DOM element, or [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter).  This provides a simple way to coerce existing event sources into streams.

```js
var clicks = most.fromEvent('click', document.querySelector('.the-button'));
```

<a name="mostfromeventwhere"/>
### most.fromEventWhere(predicate, eventType, source) -> Stream

Like [most.fromEvent](#mostfromevent), create a stream containing, but apply a `predicate` function synchronously to each event.  This allows preventDefault, filtering based on CSS selectors using [element.matches](https://developer.mozilla.org/en-US/docs/Web/API/Element.matches), and any other filtering or side effects that must be performed immediately in the DOM event call stack.

```js
// Using preventDefault
var form = document.querySelector('form');
most.fromEventWhere(function(e) { e.preventDefault(); }, 'submit', form)
	.map(parseForm)
	.map(JSON.stringify)
	.forEach(postToServer);
```

<a name="mostcreate"/>
### most.create(publisher) -> Stream

Create a push-stream for imperatively pushing events, primarily for adapting existing event sources.

```
function publisher(add:function(x:*), end:function(x:*), error:function(e:Error))
	-> function()
```

The publisher function receives 3 functions as arguments, which it can use to publish events, end the stream, or signal an error.  It may return a *dispose* function.  The dispose function will be called once all consumers have lost interest in the stream, and should free any resources held by the publisher.

#### add, end, and error
The publisher function can use `add`, `end`, and `error`:

* `add(x)` - Add `x` to the stream
* `end()` - End the stream. Any later calls to `add`, `end`, or `error` will be no-ops.
* `error(e)` - Signal that the stream has failed and cannot produce more events.

Note that if you never call `end` or `error`, the stream will never end, and consumers will wait forever for additional events.

#### dispose

If the publisher returns a dispose function, it will be called when the stream ends or errors--for example, when the publisher explicitly calls `end` or `error`, or when all consumers lose interest.

* `dispose` - free resources held by the publisher

Note that if the stream neither ends nor fails, the dispose function will never be called.

#### Examples

Using `add` and `end` to push events and then end the stream.

```js
// Add events and then end
var stream = most.create(function(add, end, error) {
	setTimeout(add, 1000, 'event 1');
	setTimeout(add, 3000, 'event 2');
	setTimeout(function(x) {
		add('event 3');
		end();
	}, 10000);

	// OPTIONAL: Return a dispose function to clean up
	// resources when the stream ends
	return function() {
		console.log('dispose');
	}
});

// Logs
// 'event 1' after 1 second
// 'event 2' after 3 seconds
// 'event 3' after 10 seconds
// 'dispose' after 10 seconds
stream.forEach(console.log.bind(console));
```

Using `error` to fail the stream and propagate an Error:

```js
// Add events and then fail
var stream = most.create(function(add, end, error) {
	setTimeout(add, 1000, 'event 1');
	setTimeout(function() {
		error(new Error('oops!'));
	}, 3000);
});

// Logs
// 'event 1' after 1 second
// '[Error: oops!]' after 3 seconds
stream
	.forEach(console.log.bind(console))
	.catch(console.log.bind(console)); // Catch the error as a promise
```


# Building streams

<a name="mostiterate">
### most.iterate(f, initial) -> Stream

Build an infinite stream by computing successive items iteratively.  Conceptually, the stream will contain: `[initial, f(initial), f(f(initial)), ...]`

```js
// An infinite stream of all integers >= 0, ie
// 0, 1, 2, 3, 4, 5, ...
most.iterate(function(x) {
	return x + 1;
}, 0);
```

<a name="mostunfold"/>
### most.unfold(f, initial) -> Stream

Build an infinite stream by computing successive items.  This operates a lower level than [most.iterate](#mostiterate), allowing you to explicitly set event timestamps, and to explicitly end the stream.
