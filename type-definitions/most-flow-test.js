// @flow

import { just, subscribe, empty, zero, continueWith, alt } from '../src'

class T1 {}
class T2 {}

var v1 = new T1
var v2 = new T2

subscribe({}, just(1))
subscribe({ next: d => { (d: number) } }, just(1))
subscribe({ error: err => { (err: Error) } }, just(1))
subscribe({ complete: () => {} }, just(1))
const { unsubscribe } = subscribe(new class {
  next() {};
  error() {};
  complete() {};
}, just(1))
unsubscribe()
// $ExpectError
subscribe()
// $ExpectError
subscribe({ next: d => { (d: string) } }, just(1))
// $ExpectError
subscribe({ error: err => { (err: string) } }, just(1))
// $ExpectError
unsubscribe(1)

empty().take(1)
zero().take(1)
// $ExpectError
empty(1)
// $ExpectError
zero(1)

// test type inference
continueWith(() => just(v2), just(v1)).observe((d: T1 | T2) => {})
alt(() => just(v2), just(v1)).observe((d: T1 | T2) => {})
just(v1).continueWith(() => just(v2)).observe((d: T1 | T2) => {})
just(v1).alt(() => just(v2)).observe((d: T1 | T2) => {})
// test existence of function parameter
continueWith((d: T1) => just(v2), just(v1))
just(v1).continueWith((d: T1) => just(v2))
// Test missing parameter
// $ExpectError
alt((d: T1) => just(v2), just(v1))
// $ExpectError
just(v1).alt((d: T1) => just(v2))
// Test returned value
// $ExpectError
alt(() => 1, just(v1))
// $ExpectError
continueWith(() => 1, just(v1))
// $ExpectError
just(v1).alt(() => 1)
// $ExpectError
just(v1).continueWith(() => 1)
