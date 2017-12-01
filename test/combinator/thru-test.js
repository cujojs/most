import { spec, referee } from 'buster'

import { thru } from '../../src/combinator/thru'

const { describe, it } = spec
const { assert } = referee

describe('thru', function () {
  it('should apply f to stream', function () {
    const stream = {}
    const expected = {}
    const f = s => expected

    assert.same(expected, thru(f, stream))
  })

  it('should throw synchronously if f throws synchronously', function () {
    const error = new Error()
    function f () {
      throw error
    }

    try {
      thru(f, {})
    } catch (e) {
      assert.same(error, e)
    }
  })
})
