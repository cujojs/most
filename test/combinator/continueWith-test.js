import { spec, referee } from 'buster'

import { continueWith } from '../../src/combinator/continueWith'
import { drain } from '../../src/combinator/observe'
import { of as just } from '../../src/source/core'

const { describe, it } = spec
const { fail, assert } = referee

describe('continueWith', () => {
  it('when f throws, should propagate error', () => {
    const error = new Error()
    const s = continueWith(() => { throw error }, just(0))
    return drain(s).then(fail, e => assert.same(error, e))
  })
})
