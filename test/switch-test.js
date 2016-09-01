import { spec, referee } from 'buster'
const { describe, it } = spec
const { assert, refute } = referee

import { switch as switchLatest } from '../src/combinator/switch'
import { observe } from '../src/combinator/observe'
import { take } from '../src/combinator/slice'
import { constant, map, tap } from '../src/combinator/transform'
import { periodic } from '../src/source/periodic'
import { fromArray } from '../src/source/fromArray'
import { empty, of as just } from '../src/source/core'

import te from './helper/testEnv'

describe('switch', () => {
  describe('when input is empty', () => {
    // need this.spy, can't use arrow function
    it('should return empty', function () {
      const spy = this.spy()
      return observe(spy, switchLatest(empty()))
        .then(() => refute(spy.called))
    })
  })

  it('should dispose penultimate stream when ending with empty', () => {
    // If we spy on the stream and collect its events, we should end
    // up seeing the same set of events as if we collect all the events
    // that can be observed (i.e. by observe())
    const events = []
    const push = x => events.push(x)
    const toInner = x => x === 0
      ? switchLatest(map(just, tap(push, take(1, periodic(1, 1)))))
      : empty()

    const s = switchLatest(map(toInner, fromArray([0, 1])))
    return te.collectEvents(s, te.ticks(10))
      .then(evs => {
        assert.equals(evs, events)
      })
  })

  describe('when input contains a single stream', () => {
    it('should return an equivalent stream', () => {
      const expected = [1, 2, 3]
      const s = just(fromArray(expected))

      return te.collectEvents(switchLatest(s), te.ticks(1))
        .then(events => {
          assert.equals(events, [
            { time: 0, value: 1 },
            { time: 0, value: 2 },
            { time: 0, value: 3 }
          ])
        })
    })
  })

  describe('when input contains many streams', () => {
    describe('and all items are instantaneous', () => {
      it('should be equivalent to the last inner stream', () => {
        const expected = [1, 2, 3]
        const s = fromArray([
          fromArray([4, 5, 6]),
          fromArray(expected)
        ])

        return te.collectEvents(switchLatest(s), te.ticks(1))
          .then(events => {
            assert.equals(events, [
              { time: 0, value: 1 },
              { time: 0, value: 2 },
              { time: 0, value: 3 }
            ])
          })
      })
    })

    it('should switch when new stream arrives', () => {
      let i = 0
      const s = map(() => constant(++i, periodic(1)), periodic(3))

      return te.collectEvents(take(10, switchLatest(s)), te.ticks(250))
        .then(events => {
          assert.equals(events, [
            { time: 0, value: 1 },
            { time: 1, value: 1 },
            { time: 2, value: 1 },
            { time: 3, value: 2 },
            { time: 4, value: 2 },
            { time: 5, value: 2 },
            { time: 6, value: 3 },
            { time: 7, value: 3 },
            { time: 8, value: 3 },
            { time: 9, value: 4 }
          ])
        })
    })
  })
})
