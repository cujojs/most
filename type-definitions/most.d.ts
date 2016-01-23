declare type SeedValue<S, V> = { seed: S, value: V };
declare type TimeValue<V>    = { time: number, value: V };

declare interface Promise<A> {}
declare interface Generator<A, B, C> {}
declare interface Iterable<A> {}

declare type CreateGenerator<A> = (...args: Array<any>) => Generator<A|Promise<A>, any, any>;

export interface Stream<A> {
  reduce<B>(f: (b: B, a: A) => B, b: B): Promise<B>;
  observe(f: (a: A) => any): Promise<any>;
  forEach(f: (a: A) => any): Promise<any>;
  drain(): Promise<any>;

  constant<B>(b: B): Stream<B>;
  map<B>(f: (a: A) => B): Stream<B>;
  tap(f: (a: A) => any): Stream<A>;
  chain<B>(f: (a: A) => Stream<B>): Stream<B>;
  flatMap<B>(f: (a: A) => Stream<B>): Stream<B>;

  // Note:  Without higher-kinded types, the types for these
  // cannot be written properly
  ap<B, C>(bs: Stream<B>): Stream<C>;
  join<B>(): Stream<B>;
  switch<B>(): Stream<B>;
  switchLatest<B>(): Stream<B>;

  continueWith(f: (a: any) => Stream<A>): Stream<A>;
  concatMap<B>(f: (a: A) => Stream<B>): Stream<B>;
  mergeConcurrently<B>(concurrency: number): Stream<B>;
  merge(...ss: Array<Stream<A>>): Stream<A>;
  combine<B>(f: (a: A, ...args: Array<any>) => B, ...ss: Array<Stream<any>>): Stream<B>;

  scan<B>(f: (b: B, a: A) => B, b: B): Stream<B>;
  loop<S, B>(f: (seed: S, a: A) => SeedValue<S, B>, seed: S): Stream<B>;

  cycle(): Stream<A>;
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

  // Note:  Without higher-kinded types, this type cannot be written properly
  await<B>(): Stream<B>;

  sample<B>(f: (...as: any[]) => B, ...ss: Array<Stream<any>>): Stream<B>;
  sampleWith<A>(sampler: Stream<any>): Stream<A>;

  zip<A>(f: (a: A, ...as: any[]) => A, ...ss: Array<Stream<any>>): Stream<A>;

  recoverWith<B>(p: (a: B) => A): Stream<A>;
  multicast<A>(): Stream<A>;
}

export function create<A>(f: (add: Function, end: Function, error: Function) => void): Stream<A>;
export function just<A>(a: A): Stream<A>;
export function of<A>(a: A): Stream<A>;
export function from<A>(as: Iterable<A>): Stream<A>;
export function periodic<A>(period: number, a?: A): Stream<A>;

export function unfold<A, B, S>(f: (seed: S) => SeedValue<S, B|Promise<B>>, seed: S): Stream<B>;
export function iterate<A>(f: (a: A) => A|Promise<A>, a: A): Stream<A>;
export function generate<A>(g: CreateGenerator<A>, ...args: Array<any>): Stream<A>;

export function reduce<A, B>(f: (b: B, a: A) => B, b: B, s: Stream<A>): Promise<B>;
export function observe<A>(f: (a: A) => any, s: Stream<A>): Promise<any>;
export function forEach<A>(f: (a: A) => any, s: Stream<A>): Promise<any>;
export function drain<A>(s: Stream<A>): Promise<any>;

export function constant<A, B>(b: B, s: Stream<A>): Stream<B>;
export function map<A, B>(f: (a: A) => B, s: Stream<A>): Stream<B>;
export function tap<A>(f: (a: A) => any, s: Stream<A>): Stream<A>;
export function ap<A, B>(fs: Stream<(a: A) => B>, as: Stream<A> ): Stream<B>;
export function chain<A, B>(f: (a: A) => Stream<B>, s: Stream<A>): Stream<B>;
export function flatMap<A, B>(f: (a: A) => Stream<B>, s: Stream<A>): Stream<B>;
export function join<A>(s: Stream<Stream<A>>): Stream<A>;
export function switchLatest<A>(s: Stream<Stream<A>>): Stream<A>;

export function continueWith<A>(f: (a: any) => Stream<A>, s: Stream<A>): Stream<A>;
export function concatMap<A, B>(f: (a: A) => Stream<B>, s: Stream<A>): Stream<B>;
export function mergeConcurrently<A>(concurrency: number, s: Stream<Stream<A>>): Stream<A>;
export function merge<A>(...ss: Array<Stream<A>>): Stream<A>;
export function combine<A>(f: (...args: Array<any>) => A, ...ss: Array<Stream<any>>): Stream<A>;

export function scan<A, B>(f: (b: B, a: A) => B, b: B, s: Stream<A>): Stream<B>;
export function loop<A, B, S>(f: (seed: S, a: A) => SeedValue<S, B>, seed: S, s: Stream<A>): Stream<B>;

export function cycle<A>(s: Stream<A>): Stream<A>;
export function concat<A>(s1: Stream<A>, s2: Stream<A>): Stream<A>;
export function startWith<A>(a: A, s: Stream<A>): Stream<A>;

export function filter<A>(p: (a: A) => boolean, s: Stream<A>): Stream<A>;
export function skipRepeats<A>(s: Stream<A>): Stream<A>;
export function skipRepeatsWith<A>(eq: (a1: A, a2: A) => boolean, s: Stream<A>): Stream<A>;

export function take<A>(n: number, s: Stream<A>): Stream<A>;
export function skip<A>(n: number, s: Stream<A>): Stream<A>;
export function takeWhile<A>(p: (a:  A) => boolean, s: Stream<A>): Stream<A>;
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
export function awaitPromises<A>(s: Stream<Promise<A>>): Stream<A>;

export function sample<A>(f: (...as: any[]) => A, sampler: Stream<any>, ...ss: Array<Stream<any>>): Stream<A>;
export function sampleWith<A>(sampler: Stream<any>, s: Stream<A>): Stream<A>;

export function zip<A>(f: (...as: any[]) => A, ...ss: Array<Stream<any>>): Stream<A>;

export function recoverWith<A, B>(p: (a: B) => A, s: Stream<A>): Stream<A>;
export function throwError(e: Error): Stream<any>;

export function multicast<A>(s: Stream<A>): Stream<A>;
