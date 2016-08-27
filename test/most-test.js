import { spec, referee } from 'buster'
const { describe, it } = spec
const { assert } = referee

import * as most from '../src/index'
import symbolObservable from 'symbol-observable'

describe('just', () => {
  it('should be an alias for of', () => {
    assert.isFunction(most.just)
    assert.same(most.just, most.of)
  })
})

describe('chain', () => {
  it('should be an alias for flatMap', () => {
    assert.isFunction(most.chain)
    assert.same(most.chain, most.flatMap)
    assert.same(most.Stream.prototype.chain, most.Stream.prototype.flatMap)
  })
})

describe('forEach', () => {
  it('should be an alias for observe', () => {
    assert.isFunction(most.forEach)
    assert.same(most.forEach, most.observe)
    assert.same(most.Stream.prototype.forEach, most.Stream.prototype.observe)
  })
})

describe('takeUntil', () => {
  it('should be an alias for until', () => {
    assert.isFunction(most.takeUntil)
    assert.same(most.takeUntil, most.until)
    assert.same(most.Stream.prototype.takeUntil, most.Stream.prototype.until)
  })
})

describe('skipUntil', () => {
  it('should be an alias for since', () => {
    assert.isFunction(most.skipUntil)
    assert.same(most.skipUntil, most.since)
    assert.same(most.Stream.prototype.skipUntil, most.Stream.prototype.since)
  })
})

describe('flatMapEnd', () => {
  it('should be an alias for continueWith', () => {
    assert.isFunction(most.flatMapEnd)
    assert.same(most.flatMapEnd, most.continueWith)
    assert.same(most.Stream.prototype.flatMapEnd, most.Stream.prototype.continueWith)
  })

  describe('flatMapError', () => {
    it('should be an alias for recoverWith', () => {
      assert.isFunction(most.flatMapError)
      assert.same(most.flatMapError, most.recoverWith)
      assert.same(most.Stream.prototype.flatMapError, most.Stream.prototype.recoverWith)
    })
  })
})

describe('multicast', () => {
  it('should be a function', () => {
    assert.isFunction(most.multicast)
    assert.isFunction(most.Stream.prototype.multicast)
  })
})

describe('Draft ES Observable API interop', () => {
  it('should exist', () => {
    assert.isFunction(most.Stream.prototype.subscribe)
    assert.isFunction(most.Stream.prototype[symbolObservable])
  })
})
