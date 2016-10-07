declare module "most" {

  type SeedValue<S, V> = { seed: S, value: V };
  type TimeValue<V> = { time: number, value: V };

  // es5 does not have typings for this
  // use any to allow type-casting
  type Generator<A> = any

  type CreateGenerator<A> = (...args: Array<any>) => Generator<A | Promise<A>>;

  export interface Sink<A> {
    event(time: number, value: A): void;
    end(time: number, value?: A): void;
    error(time: number, err: Error): void;
  }

  export interface Task {
    run(time: number): void;
    error(time: number, e: Error): void;
    dispose(): void;
  }

  export interface ScheduledTask {
    task: Task;
    run(): void;
    error(err: Error): void;
    dispose(): void;
  }

  export interface Timer {
    now(): number;
    setTimer(f: () => any, delayTime: number): Task | number;
    clearTimer(task: Task | number): void;
  }

  export interface Timeline {
    nextArrival(): number;
    isEmpty(): boolean;
    add(st: ScheduledTask): void;
    remove(st: ScheduledTask): boolean;
    removeAll(predicate: (st: ScheduledTask) => boolean): void;
    runTasks(time: number, runTask: (task: Task) => any): void;
  }

  export interface Scheduler {
    now(): number;
    asap(task: Task): ScheduledTask;
    delay(delay: number, task: Task): ScheduledTask;
    periodic(period: number, task: Task): ScheduledTask;
    schedule(delay: number, period: number, task: Task): ScheduledTask;
    cancel(task: ScheduledTask): void;
    cancelAll(predicate: (task: ScheduledTask) => boolean): void;
  }

  export interface Disposable<A> {
    dispose(): void | Promise<A>;
  }

  export interface Source<A> {
    run(sink: Sink<A>, scheduler: Scheduler): Disposable<A>;
  }

  export interface Subscriber<A> {
    next(value: A): void;
    error(err: Error): void;
    complete(value?: A): void;
  }

  export interface Subscription<A> {
    unsubscribe(): void;
  }

  export interface Stream<A> {
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

    ap<B>(fs: Stream<(a: A) => B>): Stream<B>;

    // Note: Without higher-kinded types, the types for these
    // cannot be written in a completely safe manner; See https://github.com/Microsoft/TypeScript/issues/1290
    // For better type safety, consider using most.join/switch/switchLatest with thru
    join(): A;
    switch(): A;
    switchLatest(): A;

    continueWith(f: (a: any) => Stream<A>): Stream<A>;
    flatMapEnd(f: (a: any) => Stream<A>): Stream<A>;
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

  export class Stream<A> {
    source: Source<A>;
    constructor(source: Source<A>);
  }

  export function just<A>(a: A): Stream<A>;
  export function of<A>(a: A): Stream<A>;
  export function empty(): Stream<any>;
  export function never(): Stream<any>;
  export function from<A>(as: Iterable<A>): Stream<A>;
  export function periodic<A>(period: number, a?: A): Stream<A>;
  export function fromEvent(event: string, target: any, useCapture?: boolean): Stream<Event>;

  export function unfold<A, B, S>(f: (seed: S) => SeedValue<S, B>|Promise<SeedValue<S, B>>, seed: S): Stream<B>;
  export function iterate<A>(f: (a: A) => A | Promise<A>, a: A): Stream<A>;
  export function generate<A>(g: CreateGenerator<A>, ...args: Array<any>): Stream<A>;

  export function reduce<A, B>(f: (b: B, a: A) => B, b: B, s: Stream<A>): Promise<B>;
  export function observe<A>(f: (a: A) => any, s: Stream<A>): Promise<any>;
  export function forEach<A>(f: (a: A) => any, s: Stream<A>): Promise<any>;
  export function drain<A>(s: Stream<A>): Promise<any>;

  export function subscribe<A>(subscriber: Subscriber<A>, s: Stream<A>): Subscription<A>;

  export function constant<A, B>(b: B, s: Stream<A>): Stream<B>;
  export function map<A, B>(f: (a: A) => B, s: Stream<A>): Stream<B>;
  export function tap<A>(f: (a: A) => any, s: Stream<A>): Stream<A>;
  export function ap<A, B>(fs: Stream<(a: A) => B>, as: Stream<A>): Stream<B>;
  export function chain<A, B>(f: (a: A) => Stream<B>, s: Stream<A>): Stream<B>;
  export function flatMap<A, B>(f: (a: A) => Stream<B>, s: Stream<A>): Stream<B>;
  export function join<A>(s: Stream<Stream<A>>): Stream<A>;
  export function switchLatest<A>(s: Stream<Stream<A>>): Stream<A>;

  export function continueWith<A>(f: (a: any) => Stream<A>, s: Stream<A>): Stream<A>;
  export function concatMap<A, B>(f: (a: A) => Stream<B>, s: Stream<A>): Stream<B>;
  export function mergeConcurrently<A>(concurrency: number, s: Stream<Stream<A>>): Stream<A>;

  export function merge<A>(...ss: Array<Stream<A>>): Stream<A>;
  export function mergeArray<A>(streams: Array<Stream<A>>): Stream<A>;

  export function combine<A, B, R>(
    fn: (a: A, b: B) => R,
    a: Stream<A>,
    b: Stream<B>
  ): Stream<R>;
  export function combine<A, B, C, R>(
    fn: (a: A, b: B, c: C) => R,
    a: Stream<A>,
    b: Stream<B>,
    c: Stream<C>
  ): Stream<R>;
  export function combine<A, B, C, D, R>(
    fn: (a: A, b: B, c: C, d: D) => R,
    a: Stream<A>,
    b: Stream<B>,
    c: Stream<C>,
    d: Stream<D>
  ): Stream<R>;
  export function combine<A, B, C, D, E, R>(
    fn: (a: A, b: B, c: C, d: D, e: E) => R,
    a: Stream<A>,
    b: Stream<B>,
    c: Stream<C>,
    d: Stream<D>,
    e: Stream<E>
  ): Stream<R>;

  export function combineArray<A, B, R>(
    fn: (a: A, b: B) => R,
    streams: [Stream<A>, Stream<B>]
  ): Stream<R>;
  export function combineArray<A, B, C, R>(
    fn: (a: A, b: B, c: C) => R,
    streams: [Stream<A>, Stream<B>, Stream<C>]
  ): Stream<R>;
  export function combineArray<A, B, C, D, R>(
    fn: (a: A, b: B, c: C, d: D) => R,
    streams: [Stream<A>, Stream<B>, Stream<C>, Stream<D>]
  ): Stream<R>;
  export function combineArray<A, B, C, D, E, R>(
    fn: (a: A, b: B, c: C, d: D, e: E) => R,
    streams: [Stream<A>, Stream<B>, Stream<C>, Stream<D>, Stream<E>]
  ): Stream<R>;

  export function scan<A, B>(f: (b: B, a: A) => B, b: B, s: Stream<A>): Stream<B>;
  export function loop<A, B, S>(f: (seed: S, a: A) => SeedValue<S, B>, seed: S, s: Stream<A>): Stream<B>;

  export function concat<A>(s1: Stream<A>, s2: Stream<A>): Stream<A>;
  export function startWith<A>(a: A, s: Stream<A>): Stream<A>;

  export function filter<A>(p: (a: A) => boolean, s: Stream<A>): Stream<A>;
  export function skipRepeats<A>(s: Stream<A>): Stream<A>;
  export function skipRepeatsWith<A>(eq: (a1: A, a2: A) => boolean, s: Stream<A>): Stream<A>;

  export function take<A>(n: number, s: Stream<A>): Stream<A>;
  export function skip<A>(n: number, s: Stream<A>): Stream<A>;
  export function takeWhile<A>(p: (a: A) => boolean, s: Stream<A>): Stream<A>;
  export function skipWhile<A>(p: (a: A) => boolean, s: Stream<A>): Stream<A>;
  export function slice<A>(start: number, end: number, s: Stream<A>): Stream<A>;

  export function until<A>(signal: Stream<any>, s: Stream<A>): Stream<A>;
  export function takeUntil<A>(signal: Stream<any>, s: Stream<A>): Stream<A>;
  export function since<A>(signal: Stream<any>, s: Stream<A>): Stream<A>;
  export function skipUntil<A>(signal: Stream<any>, s: Stream<A>): Stream<A>;
  export function during<A>(timeWindow: Stream<Stream<any>>, s: Stream<A>): Stream<A>;
  export function throttle<A>(period: number, s: Stream<A>): Stream<A>;
  export function debounce<A>(period: number, s: Stream<A>): Stream<A>;

  export function timestamp<A>(s: Stream<A>): Stream<TimeValue<A>>;
  export function delay<A>(dt: number, s: Stream<A>): Stream<A>;

  export function fromPromise<A>(p: Promise<A>): Stream<A>;
  export function await<A>(s: Stream<Promise<A>>): Stream<A>;

  export function sample<A, B, R>(
    fn: (a: A, b: B) => R,
    sampler: Stream<any>,
    a: Stream<A>,
    b: Stream<B>
  ): Stream<R>;
  export function sample<A, B, C, R>(
    fn: (a: A, b: B, c: C) => R,
    sampler: Stream<any>,
    a: Stream<A>,
    b: Stream<B>,
    c: Stream<C>
  ): Stream<R>;
  export function sample<A, B, C, D, R>(
    fn: (a: A, b: B, c: C, d: D) => R,
    sampler: Stream<any>,
    a: Stream<A>,
    b: Stream<B>,
    c: Stream<C>,
    d: Stream<D>
  ): Stream<R>;
  export function sample<A, B, C, D, E, R>(
    fn: (a: A, b: B, c: C, d: D, e: E) => R,
    sampler: Stream<any>,
    a: Stream<A>,
    b: Stream<B>,
    c: Stream<C>,
    d: Stream<D>,
    e: Stream<E>
  ): Stream<R>;

  export function sampleWith<A>(sampler: Stream<any>, s: Stream<A>): Stream<A>;

  export function zip<A, B, R>(
    fn: (a: A, b: B) => R,
    a: Stream<A>,
    b: Stream<B>
  ): Stream<R>;
  export function zip<A, B, C, R>(
    fn: (a: A, b: B, c: C) => R,
    a: Stream<A>,
    b: Stream<B>,
    c: Stream<C>
  ): Stream<R>;
  export function zip<A, B, C, D, R>(
    fn: (a: A, b: B, c: C, d: D) => R,
    a: Stream<A>,
    b: Stream<B>,
    c: Stream<C>,
    d: Stream<D>
  ): Stream<R>;
  export function zip<A, B, C, D, E, R>(
    fn: (a: A, b: B, c: C, d: D, e: E) => R,
    a: Stream<A>,
    b: Stream<B>,
    c: Stream<C>,
    d: Stream<D>,
    e: Stream<E>
  ): Stream<R>;
  export function recoverWith<A, B>(p: (a: B) => Stream<A>, s: Stream<A>): Stream<A>;
  export function throwError(e: Error): Stream<any>;

  export function multicast<A>(s: Stream<A>): Stream<A>;
}

declare module "most/src/scheduler/ClockTimer" {
  import { Task, Timer } from 'most';
  class ClockTimer implements Timer {
    now(): number;
    setTimer(f: () => any, dt: number): Task | number;
    clearTimer(task: Task | number): void;
  }

  export default ClockTimer;
}

declare module "most/lib/scheduler/ClockTimer" {
  import ClockTimer from 'most/src/scheduler/ClockTimer';

  export = ClockTimer;
}

declare module "most/src/scheduler/defaultScheduler" {
  import { Scheduler } from 'most';
  const defaultScheduler: Scheduler;
  export default defaultScheduler;
}

declare module "most/lib/scheduler/defaultScheduler" {
  import defaultScheduler from 'most/src/scheduler/defaultScheduler';
  export = defaultScheduler;
}

declare module "most/src/scheduler/PropagateTask" {
  import { Task, Sink } from 'most';
  class PropagateTask<T> implements Task {
    public active: boolean;
    constructor(run: (t: number, x: T, sink: Sink<T>) => any, value: T, sink: Sink<T>);
    static event<T>(x: T, sink: Sink<T>): PropagateTask<T>;
    static end<T>(x: T, sink: Sink<T>): PropagateTask<T>;
    static error(err: Error, sink: Sink<any>): PropagateTask<any>;
    dispose(): void;
    run(time: number): void;
    error(time: number, err: Error): void;
  }

  export default PropagateTask;
}

declare module "most/lib/scheduler/PropagateTask" {
  import PropagateTask from "most/src/scheduler/PropagateTask";

  export = PropagateTask;
}

declare module "most/src/scheduler/ScheduledTask" {
  import { Task, Scheduler, ScheduledTask as IScheduledTask } from 'most';

  class ScheduledTask implements IScheduledTask {
    public task: Task;
    constructor(delay: number, period: number, task: Task, scheduler: Scheduler);
    run(): void;
    error(err: Error): void;
    dispose(): void;
  }

  export default ScheduledTask;
}

declare module "most/lib/scheduler/ScheduledTask" {
  import ScheduledTask from "most/src/scheduler/ScheduledTask";

  export = ScheduledTask;
}

declare module "most/src/scheduler/Scheduler" {
  import { Scheduler as IScheduler, Timer, Timeline, ScheduledTask, Task } from 'most';

  class Scheduler implements IScheduler {
    constructor(timer: Timer, timeline: Timeline);
    now(): number;
    asap(task: Task): ScheduledTask;
    delay(delay: number, task: Task): ScheduledTask;
    periodic(period: number, task: Task): ScheduledTask;
    schedule(delay: number, period: number, task: Task): ScheduledTask;
    cancel(task: ScheduledTask): void;
    cancelAll(predicate: (task: Task) => boolean): void;
    // only available to subclasses of Scheduler
    protected _reschedule(): void;
    protected _unschedule(): void;
    protected _scheduleNextRun(now: number): void;
    protected _scheduleNextArrival(nextArrival: number, now: number): void;
    protected _runReadyTasks(now: number): void;
    protected _runReadyTasksBound(): void;
  }

  export default Scheduler;
}

declare module "most/lib/scheduler/Scheduler" {
  import Scheduler from "most/src/scheduler/Scheduler";

  export = Scheduler;
}

declare module "most/src/scheduler/Timeline" {
  import { Timeline as ITimeline, ScheduledTask, Task } from 'most';

  class Timeline implements ITimeline {
    public tasks: Array<ScheduledTask>;
    nextArrival(): number;
    isEmpty(): boolean;
    add(task: ScheduledTask): void;
    remove(task: ScheduledTask): boolean;
    removeAll(predicate: (task: Task) => boolean): void;
    runTasks(time: number, runTask: (task: Task) => any): void;
  }

  export default Timeline;
}

declare module "most/lib/scheduler/Timeline" {
  import Timeline from "most/src/scheduler/Timeline";
  export = Timeline;
}

declare module "most/src/disposable/Disposable" {
  import { Disposable as IDisposable } from 'most';

  class Disposable<T> implements IDisposable<T> {
    constructor(dispose: (data: T | void) => Promise<T> | void, data?: T);
    dispose(): void | Promise<T>;
  }

  export default Disposable;
}

declare module "most/lib/disposable/Disposable" {
  import Disposable from 'most/src/disposable/Disposable';
  export = Disposable;
}

declare module "most/src/disposable/SettableDisposable" {
  import { Disposable } from 'most';

  class SettableDisposable<T> implements Disposable<T> {
    setDisposable(disposable: Disposable<T>): void;
    dispose(): void | Promise<T>;
  }

  export default SettableDisposable;
}

declare module "most/lib/disposable/SettableDisposable" {
  import SettableDisposable from 'most/src/disposable/SettableDisposable';
  export = SettableDisposable;
}

declare module "most/src/disposable/dispose" {
  import { Disposable, Sink } from 'most';
  import SettableDisposable = require('most/src/disposable/SettableDisposable');

  export function tryDispose<T>(t: number, disposable: Disposable<T>, sink: Sink<T>): Promise<T> | T | void;
  export function create<T>(dispose: (data: T | void) => Promise<T> | void, data?: T): Disposable<T>;
  export function empty(): Disposable<void>;

  export interface DisposeAllFn {
    <A>(disposables: [Disposable<A>]): Disposable<[A]>;
    <A, B>(disposables: [Disposable<A>, Disposable<B>]): Disposable<[A, B]>;
    <A, B, C>(disposables: [Disposable<A>, Disposable<B>, Disposable<C>]): Disposable<[A, B, C]>;
    <A, B, C, D>(disposables: [Disposable<A>, Disposable<B>, Disposable<C>, Disposable<D>]): Disposable<[A, B, C, D]>;
    <A, B, C, D, E>(disposables: [Disposable<A>, Disposable<B>, Disposable<C>, Disposable<D>, Disposable<E>]): Disposable<[A, B, C, D, E]>;
    <A, B, C, D, E, F>(disposables: [Disposable<A>, Disposable<B>, Disposable<C>, Disposable<D>, Disposable<E>, Disposable<F>]): Disposable<[A, B, C, D, E, F]>;
    <A, B, C, D, E, F, G>(disposables: [Disposable<A>, Disposable<B>, Disposable<C>, Disposable<D>, Disposable<E>, Disposable<F>, Disposable<G>]): Disposable<[A, B, C, D, E, F, G]>;
    <A, B, C, D, E, F, G, H>(disposables: [Disposable<A>, Disposable<B>, Disposable<C>, Disposable<D>, Disposable<E>, Disposable<F>, Disposable<G>, Disposable<H>]): Disposable<[A, B, C, D, E, F, G, H]>;
    <A, B, C, D, E, F, G, H, I>(disposables: [Disposable<A>, Disposable<B>, Disposable<C>, Disposable<D>, Disposable<E>, Disposable<F>, Disposable<G>, Disposable<H>, Disposable<I>]): Disposable<[A, B, C, D, E, F, G, H, I]>;
    <A, B, C, D, E, F, G, H, I, J>(disposables: [Disposable<A>, Disposable<B>, Disposable<C>, Disposable<D>, Disposable<E>, Disposable<F>, Disposable<G>, Disposable<H>, Disposable<I>, Disposable<J>]): Disposable<[A, B, C, D, E, F, G, H, I, J]>;
    (...disposables: Array<Disposable<any>>): Disposable<Array<any>>;
  }

  export const all: DisposeAllFn;

  export function settable<T>(): SettableDisposable<T>;

  export function promised<T>(diposablePromise: Promise<Disposable<T>>): Disposable<T>;
  export function once<T>(disposable: Disposable<T>): Disposable<T>;
}

declare module "most/lib/disposable/dispose" {
  export * from 'most/src/disposable/dispose';
}

declare module "most/src/sink/DeferredSink" {
  import { Sink } from 'most';

  class DeferredSink<T> implements Sink<T> {
    constructor(sink: Sink<T>);
    event(time: number, value: T): void;
    end(time: number, value?: T): void;
    error(time: number, err: Error): void;
  }

  export default DeferredSink;
}

declare module "most/lib/sink/DeferredSink" {
  import DeferredSink from 'most/src/sink/DeferredSink';
  export = DeferredSink;
}

declare module "most/src/sink/IndexSink" {
  import { Sink } from 'most';

  class IndexSink<T> implements Sink<T> {
    public index: number;
    public value: T;
    public active: boolean;
    public sink: Sink<IndexSink<T>>;
    constructor(index: number, sink: Sink<IndexSink<T>>);
    event(time: number, value: T): void;
    end(time: number, value?: T): void;
    error(time: number, err: Error): void;
  }

  export default IndexSink;
}

declare module "most/lib/sink/IndexSink" {
  import IndexSink from 'most/src/sink/IndexSink';
  export = IndexSink;
}

declare module "most/src/sink/Pipe" {
  import { Sink } from 'most'

  class Pipe<T> implements Sink<T> {
    constructor(sink: Sink<T>);
    event(time: number, value: T): void;
    end(time: number, value?: T): void;
    error(time: number, err: Error): void;
  }

  export default Pipe;
}

declare module "most/lib/sink/Pipe" {
  import Pipe from 'most/src/sink/Pipe';
  export = Pipe;
}

declare module "most/src/sink/SafeSink" {
  import { Sink } from 'most';

  class SafeSink<T> implements Sink<T> {
    public active: boolean;
    constructor(sink: Sink<T>);
    event(time: number, value: T): void;
    end(time: number, value?: T): void;
    error(time: number, err: Error): void;
    disable(): Sink<T>;
  }

  export default SafeSink;
}

declare module "most/lib/sink/SafeSink" {
  import SafeSink from 'most/src/sink/SafeSink';
  export = SafeSink;
}

declare module "most/src/fatalError" {
  function fatalError(err: Error): void;

  export default fatalError;
}

declare module "most/lib/fatalError" {
  import fatalError from 'most/src/fatalError';
  export = fatalError;
}

declare module "most/src/invoke" {
  interface InvokeFn {
    <A, B>(f: (a: A) => B, args: [A]): B;
    <A, B, C>(f: (a: A, b: B) => C, args: [A, B]): C;
    <A, B, C, D>(f: (a: A, b: B, c: C) => D, args: [A, B, C]): D;
    <A, B, C, D, E>(f: (a: A, b: B, c: C, d: D) => E, args: [A, B, C, D]): E;
    <R>(f: (...args: any[]) => R, args: any[]): R;
  }

  const invoke: InvokeFn;

  export default invoke;
}

declare module "most/lib/invoke" {
  import invoke from "most/src/invoke"
  export = invoke;
}

declare module "most/src/iterable" {
  // es5 doesn't have typings for an Iterable
  // use any to allow type-casting

  export function isIterable(x: any): boolean;
  export function getIterator(x: any): Iterator<any>;
  export function makeIterable<A>(f: Function, obj: any): Iterable<A>;
}

declare module "most/lib/iterable" {
  export * from 'most/src/iterable';
}

declare module "most/src/LinkedList" {
  class LinkedList<T> {
    add(x: T): void;
    remove(x: T): void;
    isEmpty(): boolean;
    dispose(): Promise<void> | Promise<Array<T>>;
  }

  export default LinkedList;
}

declare module "most/lib/LinkedList" {
  import LinkedList from 'most/src/LinkedList'
  export = LinkedList;
}

declare module "most/src/Promise" {
  export function isPromise(x: any): boolean;
}

declare module "most/lib/Promise" {
  export * from 'most/src/Promise';
}

declare module "most/src/Queue" {
  class Queue<T> {
    constructor(capPow2: number);
    push(x: T): void;
    shift(): T;
    isEmpty(): boolean;
    length(): number;
  }

  export default Queue;
}

declare module "most/lib/Queue" {
  import Queue from 'most/src/Queue';
  export = Queue;
}

declare module "most/src/runSource" {
  import { Source, Scheduler } from 'most';
  export function withDefaultScheduler<T>(source: Source<T>): Promise<T>;
  export function withScheduler<T>(source: Source<T>, scheduler: Scheduler): Promise<T>;
}

declare module "most/lib/runSource" {
  export * from 'most/src/runSource';
}

declare module "most/src/Stream" {
  import { Source } from 'most';
  class Stream<T> {
    public source: Source<T>;
    constructor(source: Source<T>);
  }

  export default Stream;
}

declare module "most/lib/Stream" {
  import Stream from 'most/src/Stream';
  export = Stream;
}

declare module "most/src/task" {
  import { Task } from 'most';
  export function runTask(task: Task): void;
  export function defer(task: Task): Promise<void>;
}

declare module "most/lib/task" {
  export * from 'most/src/task';
}
