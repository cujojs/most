import { spec, referee } from 'buster'

import { fromArray } from '../../src/source/fromArray'
import { map } from '../../src/combinator/transform'
import { subscribe } from '../../src/observable/subscribe'

const { describe, it } = spec
const { fail, assert } = referee

describe('unsubscribe', () => {
  it('should prevent observation after unsubscribe', done => {
    const f = x => {
      assert.same(1, x)
      subscription.unsubscribe()
      done()
    }

    const subscriber = { next: fail, error: fail, complete: fail }
    let subscription = subscribe(subscriber, map(f, fromArray([1, 2])))
  })
})
