// @flow

import { just, subscribe } from '../../src'

subscribe({}, just(1))
subscribe({ next: d => { (d: number) } }, just(1)) // eslint-disable-line no-unused-expressions
subscribe({ error: err => { (err: Error) } }, just(1)) // eslint-disable-line no-unused-expressions
subscribe({ complete: () => {} }, just(1)) // eslint-disable-line no-unused-expressions
const { unsubscribe } = subscribe(new class {
  next () {};
  error () {};
  complete () {};
}(), just(1))
unsubscribe()
// $ExpectError
subscribe()
// $ExpectError
subscribe({ next: d => { (d: string) } }, just(1)) // eslint-disable-line no-unused-expressions
// $ExpectError
subscribe({ error: err => { (err: string) } }, just(1)) // eslint-disable-line no-unused-expressions
// $ExpectError
unsubscribe(1)
