import { spec, referee } from 'buster'
const { describe, it } = spec
const { assert } = referee

import { count } from '../../src/combinator/count'
import { drain } from '../../src/combinator/observe'
import { from } from '../../src/source/from'

describe('count', () => {
  it('counts the number of emitted values', () => {
    const stream = count(from([null, null, null]))

    return drain(stream).then(x => {
      assert.same(x, 3)
    })
  })
})
