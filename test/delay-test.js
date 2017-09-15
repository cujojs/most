import { spec, referee } from 'buster'
const { describe, it } = spec
const { assert } = referee

import { delay } from '../src/combinator/delay'
import { collectEvents, makeEvents, ticks } from './helper/testEnv'

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
})
