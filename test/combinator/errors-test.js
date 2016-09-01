import { spec, referee } from 'buster'
const { describe, it } = spec
const { fail, assert } = referee

import { throwError, recoverWith } from '../../src/combinator/errors'
import { map } from '../../src/combinator/transform'
import { observe, drain } from '../../src/combinator/observe'
import { of as just } from '../../src/source/core'

const sentinel = { value: 'sentinel' }
const other = { value: 'other' }

describe('throwError', () => {
  it('should create a Stream containing only an error', () => {
    return observe(() => {
      throw other
    }, throwError(sentinel))
      .catch(e => assert.same(e, sentinel))
  })
})

describe('recoverWith', () => {
  it('when an error is thrown should continue with returned stream', () => {
    const s = recoverWith(() => just(sentinel), throwError(other))
    return observe(x => assert.same(sentinel, x), s)
  })

  it('should recover from errors before recoverWith', () => {
    const s = map(() => {
      throw new Error()
    }, just(other))

    return observe(x => assert.same(sentinel, x),
      recoverWith(() => just(sentinel), s))
  })

  it('should not recover from errors after recoverWith', () => {
    const s = recoverWith(function (e) {
      throw other
    }, just(123))

    return observe(() => {
      throw sentinel
    }, s).catch(e => assert.same(sentinel, e))
  })

  it('should only recover first error if recovered stream also errors', () => {
    const s = recoverWith(() => throwError(sentinel), throwError(other))

    return observe(() => {
      throw new Error()
    }, s).catch(e => assert.same(sentinel, e))
  })

  it('when f throws, should propagate error', () => {
    const error = new Error()
    const s = recoverWith(x => { throw error }, throwError(new Error()))
    return drain(s).then(fail, e => assert.same(error, e))
  })
})
