/* global describe, it */
require('buster').spec.expose()
const { expect } = require('buster')

const most = require('../src')

const reduceOne = s => s.reduce((acc, x) => [...acc, x], [])

const reduceTwo = (s1, s2) => Promise.all([reduceOne(s1), reduceOne(s2)])

describe('Alt', () => {
  it('should satisfy associativity', () => {
    const s1 = most.of(1).continueWith(() => most.of(2)).continueWith(() => most.of(3))
    const s2 = most.of(1).continueWith(() => most.of(2).continueWith(() => most.of(3)))

    return reduceTwo(s1, s2).then(([r1, r2]) => {
      expect(r1).toEqual(r2)
    })
  })

  it('should satisfy distributivity', () => {
    const f = x => x + 10
    const s1 = most.of(1).continueWith(() => most.of(2)).map(f)
    const s2 = most.of(1).map(f).continueWith(() => most.of(2).map(f))

    return reduceTwo(s1, s2).then(([r1, r2]) => {
      expect(r1).toEqual(r2)
    })
  })
})

describe('Plus', () => {
  it('should satisfy right identity', () => {
    const s = most.of(1).continueWith(() => most.zero())

    return reduceOne(s).then(r => {
      expect(r).toEqual([1])
    })
  })

  it('should satisfy left identity', () => {
    const s = most.zero().continueWith(() => most.of(1))

    return reduceOne(s).then(r => {
      expect(r).toEqual([1])
    })
  })

  it('should satisfy annihilation', () => {
    const f = x => x + 10
    const s1 = most.zero().map(f)
    const s2 = most.zero()

    return reduceTwo(s1, s2).then(([r1, r2]) => {
      expect(r1).toEqual(r2)
    })
  })
})
