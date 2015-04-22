# most.js Concepts

## Reactive programming

Consider the following statement:

```js
var x = a + b;
```

In imperative JavaScript, this statement expresses a one-time *assignment*.  We know that the value of `a + b` will be stored in the variable `x` when the statement is executed.  If `a` or `b` changes later, `x` will not.

A different way to interpret `x = a + b` is as a declaration of equivalence: `x` and `a + b` *represent the same thing*, and anywhere you'd write `a + b`, you could instead write `x`.  The obvious implication is that if `a` or `b` changes, `x` will change as well.

Reactive programming is an approach that allows you to program using this model.  Instead of static values, reactive variables represent dynamic values that change over time.

Streams are a powerful data structure that can represent both time-varying values, such as `x`, `a`, and `b,` in the equivalence `x = a + b`, or the value of an `<input>`, as well as discrete events, such as button clicks.

most.js provides operations for creating, transforming, and composing streams.

## Streams

A stream is a sequence of events that occur over time.  Streams are asynchronous and may be infinite.

In some ways, streams are like Arrays or lists, except that each event in a stream has a specific *time* at which it arrives.  Streams provide many operations that are similar to those of Arrays, such as [`map`](api.md#map), and [`filter`](api.md#filter).  They also provide other operations that don't make sense for Arrays--operations related to *time*.  For example, [`until`](api.md#until), and [`skip`](api.md#skip) allow you to slice a stream based on time rather than on indices.

Streams provide a powerful abstraction and API to create and compose asynchronous operations.

## Higher order streams

A Higher-order stream is a "stream of streams": a stream whose event values are themselves streams.

Conceptually, a higher-order stream is like an Array of Arrays: `[[1,2,3], [4,5,6], [4,5,6]]`.  For example, to create a higher-order stream similar to that:

```js
most.from([most.from([1,2,3]), most.from([4,5,6]), most.from([7,8,9])]);
```

That's not a terribly interesting higher-order stream since it can be easily done with Arrays.  However, higher-order streams can express much more useful things. For example, here is a stream representing all of the mouse move events that occur for 5 seconds after the first mouse click:

```js
var firstClick = most.fromEvent('click', document).take(1);
var mousemovesAfterFirstClick = firstClick.map(function() {
	return most.fromEvent('mousemove', document).takeUntil(most.of().delay(5000));
});
```

In that case `mousemovesAfterFirstClick` is a higher order stream containing one event, whose value is a *stream* of `mousemove` events.

Events from the "inner" streams can be surfaced using the [higher-order stream combinators](api.md#combining-higher-order-streams).  For example, the following will log all `mousemove` events after the first click:

```js
// join() "flattens" a higher order stream
mousemovesAfterFirstClick.join()
	.observe(console.log.bind(console));
```

## Time windows

A time window is a time period, anchored at a particular start time.  For example: "from 1pm to 2pm on Tuesday", or "the time between the first mouse click and the first keypress that follows."

A time window can be represented as a higher-order stream.  The first event of the outer stream defines the start time, and the first event of the inner stream defines the end of the time period.

```js
// After the first click, log mouse move events for 1 second.
// Note that DOM event handlers will automatically be unregistered.
var start = most.fromEvent('click', document);
var end = most.of().delay(1000);

// Map the first click to a stream containing a 1 second delay
// The click represents the window start time, after which
// the window will be open for 1 second.
var timeWindow = start.constant(end);

most.fromEvent('mousemove', document)
	.during(timeWindow)
	.observe(console.log.bind(console));
```
