declare module "most" {

  declare type SeedValue<S, V> = { seed: S, value: V };
  declare type TimeValue<V> = { time: number, value: V };

  declare type CreateGenerator<A> = (...args: Array<any>) => Generator<A|Promise<A>, any, any>;

  declare export interface Sink<A> {
    event(time: number, value: A): void;
    end(time: number, value?: A): void;
    error(time: number, err: Error): void;
  }

  declare export interface Task {
    run(time: number): void;
    error(time: number, e: Error): void;
    dispose(): void;
  }

  declare export interface ScheduledTask {
    task: Task;
    run(): void;
    error(err: Error): void;
    dispose(): void;
  }

  declare export interface Scheduler {
    now(): number;
    asap(task: Task): ScheduledTask;
    delay(task: Task): ScheduledTask;
    periodic(task: Task): ScheduledTask;
    schedule(delay: number, period: number, task: Task): ScheduledTask;
    cancel(task: Task): void;
    cancelAll(predicate: (task: Task) => boolean): void;
  }

  declare export interface Disposable<A> {
    dispose(): void | Promise<any>;
  }

  declare export interface Source<A> {
    run (sink: Sink<A>, scheduler: Scheduler): Disposable<A>;
  }

  declare export interface Subscriber<A> {
    next(value: A): void;
    error(err: Error): void;
    complete(value?: A): void;
  }

  declare export interface Subscription<A> {
    unsubscribe(): void;
  }

  declare export interface Stream<A> {
    reduce<B>(f: (b: B, a: A) => B, b: B): Promise<B>;
    observe(f: (a: A) => any): Promise<any>;
    forEach(f: (a: A) => any): Promise<any>;
    drain(): Promise<any>;
    subscribe(subscriber: Subscriber<A>): Subscription<A>;

    constant<B>(b: B): Stream<B>;
    map<B>(f: (a: A) => B): Stream<B>;
    tap(f: (a: A) => any): Stream<A>;
    chain<B>(f: (a: A) => Stream<B>): Stream<B>;
    flatMap<B>(f: (a: A) => Stream<B>): Stream<B>;

    ap<B, C>(fs: Stream<(a: A) => B>): Stream<C>;

    // Note: Without higher-kinded types, the types for these
    // cannot be written in a completely safe manner; See https://github.com/Microsoft/TypeScript/issues/1290
    // For better type safety, consider using most.join/switch/switchLatest with thru
    join(): A;
    switch(): A;
    switchLatest(): A;

    continueWith(f: (a: any) => Stream<A>): Stream<A>;
    concatMap<B>(f: (a: A) => Stream<B>): Stream<B>;
    mergeConcurrently<B>(concurrency: number): Stream<B>;
    merge(...ss: Array<Stream<A>>): Stream<A>;
    mergeArray(streams: Array<Stream<A>>): Stream<A>;

    combine<B, R>(
      fn: (a: A, b: B) => R,
      b: Stream<B>
    ): Stream<R>;
    combine<B, C, R>(
      fn: (a: A, b: B, c: C) => R,
      b: Stream<B>,
      c: Stream<C>
    ): Stream<R>;
    combine<B, C, D, R>(
      fn: (a: A, b: B, c: C, d: D) => R,
      b: Stream<B>,
      c: Stream<C>,
      d: Stream<D>
    ): Stream<R>;
    combine<B, C, D, E, R>(
      fn: (a: A, b: B, c: C, d: D, e: E) => R,
      b: Stream<B>,
      c: Stream<C>,
      d: Stream<D>,
      e: Stream<E>
    ): Stream<R>;

    combine<B, R>(
      fn: (a: A, b: B) => R,
      b: Stream<B>
    ): Stream<R>;
    combine<B, C, R>(
      fn: (a: A, b: B, c: C) => R,
      b: Stream<B>,
      c: Stream<C>
    ): Stream<R>;
    combine<B, C, D, R>(
      fn: (a: A, b: B, c: C, d: D) => R,
      b: Stream<B>,
      c: Stream<C>,
      d: Stream<D>
    ): Stream<R>;
    combine<B, C, D, E, R>(
      fn: (a: A, b: B, c: C, d: D, e: E) => R,
      b: Stream<B>,
      c: Stream<C>,
      d: Stream<D>,
      e: Stream<E>
    ): Stream<R>;

    combineArray<B, R>(
      fn: (a: A, b: B) => R,
      streams: [Stream<B>]
    ): Stream<R>;
    combineArray<B, C, R>(
      fn: (a: A, b: B, c: C) => R,
      streams: [Stream<B>, Stream<C>]
    ): Stream<R>;
    combineArray<B, C, D, R>(
      fn: (a: A, b: B, c: C, d: D) => R,
      streams: [Stream<B>, Stream<C>, Stream<D>]
    ): Stream<R>;
    combineArray<B, C, D, E, R>(
      fn: (a: A, b: B, c: C, d: D, e: E) => R,
      streams: [Stream<B>, Stream<C>, Stream<D>, Stream<E>]
    ): Stream<R>;
    combineArray<V, R>(
      fn: (a: A, ...rest: V[]) => R,
      streams: Stream<V>[]
    ): Stream<R>;

    scan<B>(f: (b: B, a: A) => B, b: B): Stream<B>;
    loop<S, B>(f: (seed: S, a: A) => SeedValue<S, B>, seed: S): Stream<B>;

    concat(s2: Stream<A>): Stream<A>;
    startWith(a: A): Stream<A>;

    filter(p: (a: A) => boolean): Stream<A>;
    skipRepeats(): Stream<A>;
    skipRepeatsWith(eq: (a1: A, a2: A) => boolean): Stream<A>;

    take(n: number): Stream<A>;
    skip(n: number): Stream<A>;
    takeWhile(p: (a: A) => boolean): Stream<A>;
    skipWhile(p: (a: A) => boolean): Stream<A>;
    slice(start: number, end: number): Stream<A>;

    until(signal: Stream<any>): Stream<A>;
    takeUntil(signal: Stream<any>): Stream<A>;
    since(signal: Stream<any>): Stream<A>;
    skipUntil(signal: Stream<any>): Stream<A>;
    during(timeWindow: Stream<Stream<any>>): Stream<A>;
    throttle(period: number): Stream<A>;
    debounce(period: number): Stream<A>;

    timestamp(): Stream<TimeValue<A>>;
    delay(dt: number): Stream<A>;

    // Note: Without higher-kinded types, this type cannot be written properly
    await<B>(): Stream<B>;

    sample<B, C, R>(
      fn: (b: B, c: C) => R,
      b: Stream<B>,
      c: Stream<C>
    ): Stream<R>;
    sample<B, C, D, R>(
      fn: (b: B, c: C, d: D) => R,
      b: Stream<B>,
      c: Stream<C>,
      d: Stream<D>
    ): Stream<R>;
    sample<B, C, D, E, R>(
      fn: (b: B, c: C, d: D, e: E) => R,
      b: Stream<B>,
      c: Stream<C>,
      d: Stream<D>,
      e: Stream<E>
    ): Stream<R>;

    sampleWith<A>(sampler: Stream<any>): Stream<A>;

    zip<B, R>(
      fn: (a: A, b: B) => R,
      b: Stream<B>
    ): Stream<R>;
    zip<B, C, R>(
      fn: (a: A, b: B, c: C) => R,
      b: Stream<B>,
      c: Stream<C>
    ): Stream<R>;
    zip<B, C, D, R>(
      fn: (a: A, b: B, c: C, d: D) => R,
      b: Stream<B>,
      c: Stream<C>,
      d: Stream<D>
    ): Stream<R>;
    zip<B, C, D, E, R>(
      fn: (a: A, b: B, c: C, d: D, e: E) => R,
      b: Stream<B>,
      c: Stream<C>,
      d: Stream<D>,
      e: Stream<E>
    ): Stream<R>;

    recoverWith<B>(p: (a: B) => Stream<A>): Stream<A>;
    multicast(): Stream<A>;

    thru<B>(transform: (stream: Stream<A>) => Stream<B>): Stream<B>;
  }

  declare interface DisposeFn {
    (): void|Promise<any>;
  }

  declare function just<A>(a: A): Stream<A>;
  declare function of<A>(a: A): Stream<A>;
  declare function empty(): Stream<any>;
  declare function never(): Stream<any>;
  declare function from<A>(as: Iterable<A>): Stream<A>;
  declare function periodic<A>(period: number, a?: A): Stream<A>;
  declare function fromEvent(event: string, target: any, useCapture?: boolean): Stream<Event>;

  declare function unfold<A, B, S>(f: (seed: S) => SeedValue<S, B|Promise<B>>, seed: S): Stream<B>;
  declare function iterate<A>(f: (a: A) => A|Promise<A>, a: A): Stream<A>;
  declare function generate<A>(g: CreateGenerator<A>, ...args: Array<any>): Stream<A>;

  declare function reduce<A, B>(f: (b: B, a: A) => B, b: B, s: Stream<A>): Promise<B>;
  declare function observe<A>(f: (a: A) => any, s: Stream<A>): Promise<any>;
  declare function forEach<A>(f: (a: A) => any, s: Stream<A>): Promise<any>;
  declare function drain<A>(s: Stream<A>): Promise<any>;

  declare function subscribe<A>(subscriber: Subscriber<A>, s: Stream<A>): Subscription<A>;

  declare function constant<A, B>(b: B, s: Stream<A>): Stream<B>;
  declare function map<A, B>(f: (a: A) => B, s: Stream<A>): Stream<B>;
  declare function tap<A>(f: (a: A) => any, s: Stream<A>): Stream<A>;
  declare function ap<A, B>(fs: Stream<(a: A) => B>, as: Stream<A> ): Stream<B>;
  declare function chain<A, B>(f: (a: A) => Stream<B>, s: Stream<A>): Stream<B>;
  declare function flatMap<A, B>(f: (a: A) => Stream<B>, s: Stream<A>): Stream<B>;
  declare function join<A>(s: Stream<Stream<A>>): Stream<A>;
  declare function switchLatest<A>(s: Stream<Stream<A>>): Stream<A>;

  declare function continueWith<A>(f: (a: any) => Stream<A>, s: Stream<A>): Stream<A>;
  declare function concatMap<A, B>(f: (a: A) => Stream<B>, s: Stream<A>): Stream<B>;
  declare function mergeConcurrently<A>(concurrency: number, s: Stream<Stream<A>>): Stream<A>;

  declare function merge<A>(...ss: Array<Stream<A>>): Stream<A>;
  declare function mergeArray<A>(streams: Array<Stream<A>>): Stream<A>;

  declare function combine<A, B, R>(
    fn: (a: A, b: B) => R,
    a: Stream<A>,
    b: Stream<B>
  ): Stream<R>;
  declare function combine<A, B, C, R>(
    fn: (a: A, b: B, c: C) => R,
    a: Stream<A>,
    b: Stream<B>,
    c: Stream<C>
  ): Stream<R>;
  declare function combine<A, B, C, D, R>(
    fn: (a: A, b: B, c: C, d: D) => R,
    a: Stream<A>,
    b: Stream<B>,
    c: Stream<C>,
    d: Stream<D>
  ): Stream<R>;
  declare function combine<A, B, C, D, E, R>(
    fn: (a: A, b: B, c: C, d: D, e: E) => R,
    a: Stream<A>,
    b: Stream<B>,
    c: Stream<C>,
    d: Stream<D>,
    e: Stream<E>
  ): Stream<R>;

  declare function combineArray<A, B, R>(
    fn: (a: A, b: B) => R,
    streams: [Stream<A>, Stream<B>]
  ): Stream<R>;
  declare function combineArray<A, B, C, R>(
    fn: (a: A, b: B, c: C) => R,
    streams: [Stream<A>, Stream<B>, Stream<C>]
  ): Stream<R>;
  declare function combineArray<A, B, C, D, R>(
    fn: (a: A, b: B, c: C, d: D) => R,
    streams: [Stream<A>, Stream<B>, Stream<C>, Stream<D>]
  ): Stream<R>;
  declare function combineArray<A, B, C, D, E, R>(
    fn: (a: A, b: B, c: C, d: D, e: E) => R,
    streams: [Stream<A>, Stream<B>, Stream<C>, Stream<D>, Stream<E>]
  ): Stream<R>;
  declare function combineArray<V, R> (
    fn: (...items: V[]) => R,
    items: Stream<V>[]
  ): Stream<R>;

  declare function scan<A, B>(f: (b: B, a: A) => B, b: B, s: Stream<A>): Stream<B>;
  declare function loop<A, B, S>(f: (seed: S, a: A) => SeedValue<S, B>, seed: S, s: Stream<A>): Stream<B>;

  declare function concat<A>(s1: Stream<A>, s2: Stream<A>): Stream<A>;
  declare function startWith<A>(a: A, s: Stream<A>): Stream<A>;

  declare function filter<A>(p: (a: A) => boolean, s: Stream<A>): Stream<A>;
  declare function skipRepeats<A>(s: Stream<A>): Stream<A>;
  declare function skipRepeatsWith<A>(eq: (a1: A, a2: A) => boolean, s: Stream<A>): Stream<A>;

  declare function take<A>(n: number, s: Stream<A>): Stream<A>;
  declare function skip<A>(n: number, s: Stream<A>): Stream<A>;
  declare function takeWhile<A>(p: (a:  A) => boolean, s: Stream<A>): Stream<A>;
  declare function skipWhile<A>(p: (a: A) => boolean, s: Stream<A>): Stream<A>;
  declare function slice<A>(start: number, end: number, s: Stream<A>): Stream<A>;

  declare function until<A>(signal: Stream<any>, s: Stream<A>): Stream<A>;
  declare function takeUntil<A>(signal: Stream<any>, s: Stream<A>): Stream<A>;
  declare function since<A>(signal: Stream<any>, s: Stream<A>): Stream<A>;
  declare function skipUntil<A>(signal: Stream<any>, s: Stream<A>): Stream<A>;
  declare function during<A>(timeWindow: Stream<Stream<any>>, s: Stream<A>): Stream<A>;
  declare function throttle<A>(period: number, s: Stream<A>): Stream<A>;
  declare function debounce<A>(period: number, s: Stream<A>): Stream<A>;

  declare function timestamp<A>(s: Stream<A>): Stream<TimeValue<A>>;
  declare function delay<A>(dt: number, s: Stream<A>): Stream<A>;

  declare function fromPromise<A>(p: Promise<A>): Stream<A>;
  declare function await<A>(s: Stream<Promise<A>>): Stream<A>;

  declare function sample<A, B, R>(
    fn: (a: A, b: B) => R,
    sampler: Stream<any>,
    a: Stream<A>,
    b: Stream<B>
  ): Stream<R>;
  declare function sample<A, B, C, R>(
    fn: (a: A, b: B, c: C) => R,
    sampler: Stream<any>,
    a: Stream<A>,
    b: Stream<B>,
    c: Stream<C>
  ): Stream<R>;
  declare function sample<A, B, C, D, R>(
    fn: (a: A, b: B, c: C, d: D) => R,
    sampler: Stream<any>,
    a: Stream<A>,
    b: Stream<B>,
    c: Stream<C>,
    d: Stream<D>
  ): Stream<R>;
  declare function sample<A, B, C, D, E, R>(
    fn: (a: A, b: B, c: C, d: D, e: E) => R,
    sampler: Stream<any>,
    a: Stream<A>,
    b: Stream<B>,
    c: Stream<C>,
    d: Stream<D>,
    e: Stream<E>
  ): Stream<R>;

  declare function sampleWith<A>(sampler: Stream<any>, s: Stream<A>): Stream<A>;

  declare function zip<A, B, R>(
    fn: (a: A, b: B) => R,
    a: Stream<A>,
    b: Stream<B>
  ): Stream<R>;
  declare function zip<A, B, C, R>(
    fn: (a: A, b: B, c: C) => R,
    a: Stream<A>,
    b: Stream<B>,
    c: Stream<C>
  ): Stream<R>;
  declare function zip<A, B, C, D, R>(
    fn: (a: A, b: B, c: C, d: D) => R,
    a: Stream<A>,
    b: Stream<B>,
    c: Stream<C>,
    d: Stream<D>
  ): Stream<R>;
  declare function zip<A, B, C, D, E, R>(
    fn: (a: A, b: B, c: C, d: D, e: E) => R,
    a: Stream<A>,
    b: Stream<B>,
    c: Stream<C>,
    d: Stream<D>,
    e: Stream<E>
  ): Stream<R>;

  declare function recoverWith<A, B>(p: (a: B) => Stream<A>, s: Stream<A>): Stream<A>;
  declare function throwError(e: Error): Stream<any>;

  declare function multicast<A>(s: Stream<A>): Stream<A>;
}
