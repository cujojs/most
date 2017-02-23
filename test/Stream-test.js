import { spec, referee } from 'buster'
const { describe, it } = spec
const { assert } = referee

import Stream from '../src/Stream'

const sentinel = { value: 'sentinel' }

describe('Stream', function () {
  it('should have expected source', function () {
    const s = new Stream(sentinel)
    assert.same(sentinel, s.source)
  })

  describe('run', () => {
    it('should delegate to source', () => {
      const source = {
        run: function (sink, scheduler) {
          return {
            sink, scheduler,
            dispose () {
              return Promise.resolve(sentinel)
            }
          }
        }
      }

      const s = new Stream(source)

      const sink = {}
      const scheduler = {}
      const d = s.run(sink, scheduler)

      assert.same(sink, d.sink)
      assert.same(scheduler, d.scheduler)
      return d.dispose().then(result => assert.same(sentinel, result))
    })
  })
})
