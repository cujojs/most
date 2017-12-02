import { spec, referee } from 'buster'

import { delay } from '../src/combinator/delay'
import { map, tap } from '../src/combinator/transform'
import { switchLatest } from '../src/combinator/switch'
import { continueWith } from '../src/combinator/continueWith'
import { take } from '../src/combinator/slice'
import { of as just } from '../src/source/core'
import { periodic } from '../src/source/periodic'
import { collectEvents, makeEvents, ticks, at } from './helper/testEnv'

const { describe, it } = spec
const { assert } = referee

describe('delay', () => {
  it('should delay events by delayTime', () => {
    const n = 2
    const dt = 1
    const s = delay(dt, makeEvents(dt, n))
    return collectEvents(s, ticks(n + dt)).then(events =>
      assert.equals(events, [
        { time: 1, value: 0 },
        { time: 2, value: 1 }
      ]))
  })

  it('should dispose pending tasks', () => {
    // Test derived from example:
    // https://github.com/cujojs/most/issues/488
    let count = 0
    const toDelay = x => tap(() => count++, delay(10, just(x)))
    const s0 = switchLatest(map(toDelay, take(2, periodic(1, 1))))
    const s1 = continueWith(() => at(100, 0), s0)

    return collectEvents(s1, ticks(30)).then(() =>
      assert.equals(1, count))
  })
})
