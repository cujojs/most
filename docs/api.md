most.js API
===========

1. Reading these docs
	* [Notation](#notation)
1. Creating streams
	* [most.of](#mostof)
	* [most.fromPromise](#mostfrompromise)
	* [most.from](#mostfrom)
	* [most.repeat](#mostrepeat)
	* [most.periodic](#mostperiodic)
	* [most.empty](#mostempty)
	* [most.never](#mostnever)
	* [most.iterate](#mostiterate)
	* [most.unfold](#mostunfold)
	* [most.fromEvent](#mostfromevent)
	* [most.fromEventWhere](#mostfromeventwhere)
	* [most.create](#create)
	* [startWith](#startwith)
	* [concat](#concat)
	* [cycle](#cycle)
1. Handling errors
	* [flatMapError](#flatmaperror)
	* [throwError](#throwerror)
1. Transforming streams
	* [map](#map)
	* [constant](#constant)
	* [scan](#scan)
	* [tap](#tap)
	* [flatMap](#flatMap)
	* [ap](#ap)
1. Filtering streams
	* [filter](#filter)
	* [take](#take)
	* [takeWhile](#takeWhile)
	* [takeUntil](#takeUntil)
	* [distinct](#distinct)
	* [distinctBy](#distinctBy)
1. Consuming streams
	* [reduce](#reduce)
	* [forEach](#forEach)
1. Combining streams
	* [merge](#merge)
	* [combine](#combine)
	* [most.lift](#mostlift)
	* [zip](#zip)
1. Combining higher order streams
	* [switch](#switch)
	* [join](#join)
1. Delaying streams
	* [delay](#delay)
1. Rate limiting streams
	* [debounce](#debounce)
	* [throttle](#throttle)

## Notation

You'll see diagrams like the following:

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

### Examples

`stream: a|`

A stream that emits `a` and then ends immediately.

`stream: a-b---|`

A stream that emits `a`, then `b`, and some time later ends.

`stream: a-b-X`

A stream that emits `a`, then `b`, then fails.

`stream: abc-def->`

A stream that emits `a`, then `b`, then `c`, then nothing, then `d`, then `e`, then `f`, and then continues infinitely.

## Creating streams

### most.of

####`most.of(x) -> Stream`

```
most.of(x): x|
```

Create a stream containing only x.

```js
var stream = most.of('hello');
stream.forEach(console.log.bind(console)); // logs hello
```

### most.fromPromise

####`most.fromPromise(promise) -> Stream`

```
promise:                   ----a
most.fromPromise(promise): ----a|
```

Create a stream containing the outcome of a promise.  If the promise fulfills, the stream will contain the promise's value.  If the promise rejects, the stream will be in an error state with the promise's rejection reason as its error.  See [flatMapError](#flatmaperror) for error recovery.

### most.from

####`most.from(iterable) -> Stream`

```
most.from([1,2,3,4]): 1234|
```

Create a stream containing all items from an iterable.  The iterable can be an Array, Array-like, or anything that supports the [iterable protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/iterable) or [iterator protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/The_Iterator_protocol), such as a [generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*). Providing a finite iterable, such as an Array, creates a finite stream. Providing an infinite iterable, such as an infinite generator, creates an infinite stream.

```js
// Logs 1 2 3 4
most.from([1,2,3,4])
	.forEach(console.log.bind(console));
```

```js
// Strings are Array-like, this works
// Logs a b c d
most.from('abcd')
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

### most.repeat

####`most.repeat(x) -> Stream`

Create a stream containing infinite occurrences of `x`.

```
most.repeat(x): xxxxxxx->
```

### most.periodic

####`most.periodic(period) -> Stream`

```
most.periodic(2): a-b-c-d-e-f->
most.periodic(5): a----b----c->
```

Create an infinite stream containing events that arrive every `interval` milliseconds. The value of each event is its arrival time in milliseconds.

### most.empty

####`most.empty() -> Stream`

```
most.empty(): |
```

Create an already-ended stream containing no events.

### most.never

####`most.never() -> Stream`

```
most.never(): ---->
```

Create a stream that contains no events and never ends.

### most.iterate

####`most.iterate(f, initial) -> Stream`

Build an infinite stream by computing successive items iteratively.  Conceptually, the stream will contain: `[initial, f(initial), f(f(initial)), ...]`

```js
// An infinite stream of all integers >= 0, ie
// 0, 1, 2, 3, 4, 5, ...
most.iterate(function(x) {
	return x + 1;
}, 0);
```

### most.unfold

####`most.unfold(f, initial) -> Stream`

Build an infinite stream by computing successive items.  This operates a lower level than [most.iterate](#mostiterate), allowing you to explicitly set event timestamps, and to explicitly end the stream.

### most.fromEvent

####`most.fromEvent(eventType, source) -> Stream`

```
source:                            -a--b-c---d->
most.fromEvent(eventType, source): -a--b-c---d->
```

Create a stream containing events from the provided [EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget), such as a DOM element, or [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter).  This provides a simple way to coerce existing event sources into streams.

Note that when the stream ends (for example, by using [take](#take), [takeUntil](#takeUntil), etc.), it will automatically be disconnected from the event source.  For example, in the case of DOM events, the underlying DOM event listener will be removed automatically.

```js
var clicks = most.fromEvent('click', document.querySelector('.the-button'));
```

### most.fromEventWhere

####`most.fromEventWhere(predicate, eventType, source) -> Stream`

Like [most.fromEvent](#mostfromevent), create a stream containing, but apply a `predicate` function synchronously to each event.  This allows preventDefault, filtering based on CSS selectors using [element.matches](https://developer.mozilla.org/en-US/docs/Web/API/Element.matches), and any other filtering or side effects that must be performed immediately in the DOM event call stack.

As with `most.fromEvent`, when the stream ends, it will automatically be disconnected from the event source.

```js
// Using preventDefault
var form = document.querySelector('form');
most.fromEventWhere(function(e) { e.preventDefault(); }, 'submit', form)
	.map(parseForm)
	.map(JSON.stringify)
	.forEach(postToServer);
```

```js
// Using event delegation with Element.matches
// This allows only events with the .toggle-button class
// It also only calls preventDefault on allowed events
var form = document.querySelector('.container');
most.fromEventWhere(function(e) {
		return e.matches('.toggle-button') && e.preventDefault();
	}, 'click', container)
	.forEach(doSomething);
```

<a name="mostcreate"/>
### most.create

####`most.create(publisher) -> Stream`

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

### startWith

####`stream.startWith(x) -> Stream`
####`most.startWith(x, stream) -> Stream`

Create a new stream containing `x` followed by all events in `stream`.

```js
stream:              a-b-c-d->
stream.startWith(x): xa-b-c-d->
```

### concat

####`stream1.concat(stream2) -> Stream`
####`most.concat(stream1, stream2) -> Stream`

Create a new stream containing all events in `stream1` followed by all events in `stream2`.

```js
stream1:                 -a-b-c|
stream2:                 -d-e-f->
stream1.concat(stream2): -a-b-c-d-e-f->
```

Note that this effectively *timeshifts* events from `stream2` past the end time of `stream1`.  In contrast, other operations such as [`combine`](#combine), [`merge`](#merge), ['flatMap`](#flatmap) *preserve event arrival times*, allowing events from the multiple combined streams to interleave.

### cycle

####`stream.cycle() -> Stream`
####`most.cycle(stream) -> Stream`

Tie a stream into a circle.

```
most.from([1,2,3]):         123|
most.from([1,2,3]).cycle(): 123123123123->
```

Makes an infinite stream from a finite one.  If the input `stream` is infinite, then there will be no observable difference between `stream` and `stream.cycle()`.

## Handling errors

### flatMapError

####`stream.flatMapError(f) -> Stream`
####`most.flatMapError(f, stream) -> Stream`

Recover from a stream failure by calling a function to create a new stream.

```
stream:                 -a-b-c-X
f(X):                   -d-e-f->
stream.flatMapError(f): -a-b-c-d-e-f->
```

When a stream fails with an error, the error will be passed to `f`.  `f` must return a new stream to replace the error.

```js
var rest = require('rest');

var stream = most.fromPromise(rest('http://myapi.com/things'));

// Try to process data from the real API, but fall back
// to some default data if that fails.
stream.map(JSON.parse)
	.flatMapError(function(e) {
		// console.error(e);
		return most.of(defaultData);
	})
	.forEach(processData);
```

### most.throwError

####`most.throwError(error) -> Stream`

Create a stream in the error state.  This can be useful for functions that need to return a stream, but need to signal an error.

```js
most.throwError(X): X
```


## Transforming streams

### map

####`stream.map(f) -> Stream`
####`most.map(f, stream) -> Stream`

Create a new stream by applying `f` to each event of the input stream.

```
stream:           -a-b-c-d->
stream.map(add1): -f(a)-f(b)-f(c)-f(d)->
```

```js
// Logs 2 3 4 5
most.from([1,2,3,4])
	.map(function(x) {
		return x + 1;
	})
	.forEach(console.log.bind(console));
```

### constant

####`stream.constant(x) -> Stream`
####`most.constant(x, stream) -> Stream`

Create a new stream by replacing each event of the input stream with `x`.

```
stream:             -a-b-c-d->
stream.constant(x): -x-x-x-x->
```

```js
// Logs 1 1 1 1
most.from([1,2,3,4])
	.constant(1)
	.forEach(console.log.bind(console));
```

### scan

####`stream.scan(f, initial) -> Stream`
####`most.scan(f, initial, stream) -> Stream`

Create a new stream containing incrementally accumulated results, starting with the provided initial value.

`function f(accumulated, x) -> newAccumulated`

```
stream:              -1-2-3->
stream.scan(add, 0): 01-3-6->
```

Unlike [reduce](#reduce) which produces a single, final result, scan emits incremental results.  The resulting stream is of the same proportion as the original.  For example, if the original contains 10 events, the resulting stream will contain 11 (the initial value, followed by 10 incremental events).  If the original stream is infinite, the resulting stream will be infinite.

```js
// Logs a ab abc abcd
most.from(['a', 'b', 'c', 'd'])
	.scan(function(string, letter) {
		return string + letter;
	}, '')
	.forEach(console.log.bind(console);
```

```js
// Maintain a sliding window of (up to) 3 values in an array

// A stream containing all integers >= 0
var numbers = most.iterate(function(x) {
	return x+1;
}, 0);

// Logs
// []
// [0]
// [0,1]
// [0,1,2]
// [1,2,3]
// [2,3,4]
// ... etc ...
numbers.scan(function(slidingWindow, x) {
	return slidingWindow.concat(x).slice(-10);
}, [])
	.forEach(console.log.bind(console));
```

### tap

####`stream.tap(f) -> Stream`
####`most.map(f, stream) -> Stream`

Perform a side-effect for each event in `stream`.

```
stream:        -a-b-c-d->
stream.tap(f): -a-b-c-d->
```

For each event in `stream`, `f` is called, but the value of its result is ignored.  However, `f` may return a promise to delay subsequent events.  If `f` fails (ie throws), then the returned stream will also fail.  The stream returned by `tap` will contain the same events as the original stream (although they may be delayed when `f` returns promises).

### flatMap

####`stream.flatMap(f) -> Stream`
####`most.flatMap(f, stream) -> Stream`

Transform each event in `stream` into a stream, and then flatten it into the resulting stream. Note that `f` *must* return a stream.

`function f(x) -> Stream`

```js
// Logs 1 1 1 1 1 2 2 2 2 2 3 3 3 3 3
most.from([1, 2, 3])
	.flatMap(function(x) {
		return most.repeat(x).take(5);
	})
	.forEach(console.log.bind(console));
```

### ap

####`streamOfFunctions.ap(stream) -> Stream`
####`most.ap(streamOfFunctions, stream) -> Stream`

Apply all the functions in `streamOfFunctions` to all the values in `stream`.

```
streamOfFunctions:            f-g-h|
stream:                       x-y-z|
streamOfFunctions.ap(stream): f(x)-f(y)-f(z)-g(x)-g(y)-g(z)-h(x)-h(y)-h(z)|
```

This effectively creates the cross-product of `streamOfFunctions` and `stream`.  As shown in the diagram above, `stream` will be traversed multiple times--once for each event in `streamOfFunctions`.

## Filtering streams

### filter

####`stream.filter(predicate) -> Stream`
####`most.filter(predicate, stream) -> Stream`

Create a stream containing only events for which `predicate` returns truthy.

```
stream:              -1-2-3-4->
stream.filter(even): ---2---4->
```

### take

####`stream.take(n) -> Stream`
####`most.take(n, stream) -> Stream`

Create a new stream containing at most `n` events from `stream`.

```
stream:         -a-b-c-d-e-f->
stream.take(3): -a-b-c|

stream:         -a-b|
stream.take(3): -a-b|
```

If `stream` contains fewer than `n` events, the returned stream will be effectively equivalent to `stream`.

### takeWhile

####`stream.takeWhile(predicate) -> Stream`
####`most.takeWhile(predicate, stream) -> Stream`

Create a new stream containing all events until `predicate` returns false.

```
stream:                 -2-4-5-6-8->
stream.takeWhile(even): -2-4-|
```

### takeUntil

####`stream.takeUntil(signalStream) -> Stream`
####`most.takeUntil(signalStream, stream) -> Stream`

Create a new stream containing all events until `signalStream` emits an event.

```
stream:                         -a-b-c-d-e-f->
signalStream:                   ------z->
stream.takeUntil(signalStream): -a-b-c|
```

If `signalStream` is empty or never emits an event, then the returned stream will be effectively equivalent to `stream`.

```js
// Log mouse events until the user clicks. Note that DOM event handlers will
// automatically be unregistered.
most.fromEvent('mousemove', document)
	.takeUntil(most.fromEvent('click', document)
	.forEach(console.log.bind(console));
```

### distinct

####`stream.distinct() -> Stream`
####`most.distinct(stream) -> Stream`

Create a new stream with *adjacent duplicates* removed.

```
stream:            -1-2-2-3-4-4-5->
stream.distinct(): -1-2---3-4---5->
```

Note that `===` is used to identify duplicate items.  To use a different comparison, use [`distinctBy`](#distinctBy)

### distinctBy

####`stream.distinctBy(equals) -> Stream`
####`most.distinctBy(equals, stream) -> Stream`

Create a new stream with *adjacent duplicates* removed, using the provided `equals` function.

```
stream:                              -a-b-B-c-D-d-e->
stream.distinctBy(equalsIgnoreCase): -a-b---c-D---e->
```

The `equals` function should accept two values and return truthy if the two values are equal, or falsy if they are not equal.

`function equals(a, b) -> boolean`

## Consuming streams

### reduce

####`stream.reduce(f, initial) -> Promise`
####`most.reduce(f, initial, stream) -> Promise`

Reduce a stream, returning a promise for the ultimate result.

```
stream:                -1-2-3-4-|
stream.reduce(sum, 0):           10
```

The returned promise will fulfill with the final reduced result, or will reject if a failure occurs while reducing the stream.

The reduce function (`f` above)

*TODO: Example*

### forEach

Alias: **observe**

####`stream.forEach(f) -> Promise`
####`stream.observe(f) -> Promise`
####`most.forEach(f, stream) -> Promise`
####`most.observe(f, stream) -> Promise`

Start consuming events from `stream`, processing each with `f`.  The returned promise will fulfill after all the events have been consumed, or will reject if the stream fails and the [error is not handled](#handlingerrors).

```js
// Log mouse movements until the user clicks, then stop.
most.fromEvent('mousemove', document)
	.takeUntil(most.fromEvent('click', document))
	.forEach(console.log.bind(console));
	.then(function() {
		console.log('All done');
	});
```

## Combining streams

### merge

####`stream1.merge(stream2) -> Stream`
####`most.merge(stream1, stream2) -> Stream`

Create a new stream containing events from `stream1` and `stream2`.

```
stream1:                -a--b----c--->
stream2:                --w---x-y--z->
stream1.merge(stream2): -aw-b-x-yc-z->
```

Merging multiple streams creates a new stream containing all events from the input stream without affecting the arrival time of the events.  You can think of the events from the input streams simply being interleaved into the new, merged stream.  A merged stream ends when *all* of its input streams have ended.

In contrast to `concat`, `merge` preserves the arrival times of events. That is, it creates a new stream where events from `stream1` and `stream2` can interleave.

### combine

####`stream1.combine(f, stream2) -> Stream`
####`most.combine(f, stream1, stream2) -> Stream`

Create a new stream that emits the set of latest event values from all input streams whenever a new event arrives on any input stream.

```
stream1:                       -0--1----2--->
stream2:                       --3---4-5--6->
stream1.combine(add, stream2): --3-4-5-67-8->
```

Combining creates a new stream by applying a function to the most recent event from each stream whenever a new event arrives on any one stream.  Combining must wait for at least one event to arrive on all input streams before it can produce any events.  A combined stream ends with any one of its input streams ends.

```js
// Add the current value of two inputs
// Updates the result whenever *either* of the inputs changes!

// Create a stream from an <input> value
function fromInput(input) {
	return most.fromEvent('change', input)
		.map(function(e) { return e.target.value })
		.map(Number);
}

// Add two numbers
function add(x, y) {
	return x + y;
}

// Create streams for the current value of x and y
var xStream = fromInput(document.querySelector('input.x'));
var yStream = fromInput(document.querySelector('input.y'));

// Create a result stream by adding x and y
// This always adds the latest value of x and y
var resultStream = xStream.combine(add, yStream);

var resultNode = document.querySelector('.result');
result.forEach(function(z) {
	resultNode.textContent = z;
});
```

### most.lift

####`most.lift(f) -> function`

Lifts a function to act on streams.  Lifting returns a function that accepts streams as arguments, and returns a stream as a result.

One way to think of lifting is that it takes a function that operates on "normal" values, like two strings, and creates a function that operates on "time-varying" values--on the "current value" of two `<input>` elements, for example.

Lifting should be done at "initialization time": you should lift a function once and then use it many times.

```js
// return the concatenation of 2 strings
function append(s1, s2) {
	return s1 + s2;
}

var s1 = 'foo';
var s2 = 'bar';

// result is a string
var result = append(s1, s2);

// Logs 'foobar'
console.log(result);

// Lift the append function to operate on values that change over time
var liftedAppend = most.lift(append);

// A stream representing the "current value" of <input name="s1">
var input1 = most.fromEvent('change', document.querySelector('[name="s1"]'))
	.map(function(e) {
		return e.target.value;
	});

// A stream representing the "current value" of <input name="s2">
var input2 = most.fromEvent('change', document.querySelector('[name="s2"]'))
	.map(function(e) {
		return e.target.value;
	});

// resultStream is a stream of strings
// Whenever either input changes, resultStream will emit a new event
// It's like a live-updating value
var resultStream = liftedAppend(input1, input2);

// Logs the concatenated value of input1 and input2
// *whenever either input changes*
resultStream.forEach(console.log.bind(console));
```

### zip

####`stream1.zip(f, stream2) -> Stream`
####`most.zip(f, stream1, stream2) -> Stream`

Create a new stream by applying a function to corresponding pairs of events from the inputs streams.

```
stream1:                   -1--2--3--4->
stream2:                   -1---2---3---4->
stream1.zip(add, stream2): -2---4---6---8->
```

Zipping correlates *by index* corresponding events from two or more input streams.  Fast streams must wait for slow streams.  For pull streams, this does not cause any buffering.  However, when zipping push streams, a fast push stream, such as those created by [`most.create`](#mostcreate) and [`most.fromEvent`](#mostfromevent) will be forced to buffer events so they can be correlated with corresponding events from the slower stream.

A zipped stream ends when any one of its input streams ends.

```js
function add(x, y) {
	return x + y;
}

// Logs 5 7 9
// In other words: add(1, 4) add(2, 5) add(3, 6)
most.from([1,2,3])
	.zip(add, most.from([4,5,6,7,8]))
	.forEach(console.log.bind(console));
```

## Combining higher-order streams

A Higher-order stream is a "stream of streams": a stream whose event values are themselves streams.  Conceptually, you might think of a higher-order stream like an Array of Arrays: `[[1,2,3], [4,5,6], [4,5,6]]`.

### switch

####`stream.switch() -> Stream`
####`most.switch(stream) -> Stream`

Given a higher-order stream, return a new stream that adopts the behavior of (ie emits the events of) the most recent inner stream.

```
s:               -a-b-c-d-e-f->
t:               -1-2-3-4-5-6->
stream:          -s-----t----->
stream.switch(): -a-b-c-4-5-6->
```

*TODO: Example*

### join

####`stream.join() -> Stream`
####`most.join(stream) -> Stream`

Given a higher-order stream, return a new stream that merges all the inner streams as they arrive.

```
s:             ---a---b---c---d-->
t:             -1--2--3--4--5--6->
stream:        -s------t--------->
stream.join(): ---a---b--4c-5-d6->
```

*TODO: Example*

## Delaying streams

####`stream.delay(delayTime) -> Stream`
####`most.delay(delayTime, stream) -> Stream`

Timeshift a `stream` by `delayTime`.

```
stream:          -a-b-c-d->
stream.delay(1): --a-b-c-d->
stream.delay(5): ------a-b-c-d->
```

Delaying a stream timeshifts all the events by the same amount.  Delaying doesn't change the time *between* events.

*TODO: Example*

## Rate limiting streams

### debounce

####`stream.debounce(debounceTime) -> Stream`
####`most.debounce(debounceTime, stream) -> Stream`

Wait for a burst of events to subside and emit only the last event in the burst.

```
stream:             abcd----abcd---->
stream.debounce(2): -----d-------d-->
```

Debouncing can be extremely useful when dealing with bursts of similar events, for example, debouncing keypress events before initiating a remote search query in a browser application.

```js
var searchInput = document.querySelector('[name="search-text"]');
var searchText = most.fromEvent('input', searchInput);

// Logs the current value of the searchInput, only after the
// user stops typing for 500 millis
searchText.debounce(500)
	.map(function(e) {
		return e.target.value;
	})
	.forEach(console.log.bind(console));
```

See the [type-to-search example](../examples) for a more complete example of using `debounce`.

### throttle

####`stream.throttle(throttlePeriod) -> Stream`
####`most.throttle(throttlePeriod, stream) -> Stream`

Limit the rate of events to at most one per throttlePeriod.

```
stream:              abcd----abcd---->
stream.throttle(2):  a-c-----a-c----->
```

In contrast to debounce, throttle simply drops events that occur more often than `throttlePeriod`, whereas debounce waits for a "quiet period".
