**Stream**

Stream is just a wrapper around a source, and provides a prototype on which public-facing APIs live.

**Source**

A source represents a view of events over time.  It has a single method, `run(sink, scheduler)` which arranges to propagate events to the provided `sink`.  If it needs to deal with time, it can use `scheduler`, which has methods for knowing the current time, and scheduling future tasks in a more performant way than using `setTimeout` directly.

A source's `run` method must return an object with a `dispose` method--similar in concept to RxJS's `Disposable`.

Some sources are simple and just store parameters which get passed wholesale to a sink.  Other sources do more, especially in the case of sources that need to combine multiple streams, or deal with higher order streams.

Some sources ultimately *produce* events, such as from DOM events.  These producer sources *must never* produce an event in the same call stack as their `run` method is called.  IOW, they must begin producing items asynchronously.  In some cases, this comes for free, such as DOM events.  In other cases, it must be done explicitly, such as values from an array.

**Sink**

A sink receives signals, typically does something with them, such as transforming or filtering them, and then propagates them to another sink.  It has 3 methods, each corresponding to a type of signal: `event(t, x)`, `end(t, x)`, and `error(t, e)`, where `t` is a time, `x` is a value, and `e` is likely an Error of some sort.

Typically a combinator will be implemented as a source and a sink.  The source is usually stateless/immutable, and creates a new sink for each new stream observer.  In most cases, the relationship of stream to source is 1-1, but source to sink is 1-many.
