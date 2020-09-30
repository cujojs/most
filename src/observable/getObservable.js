/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import provideSymbolObservable from 'symbol-observable/ponyfill'

// eslint-disable-next-line no-new-func
const globalThis = new Function('return this')()
const symbolObservable = provideSymbolObservable(globalThis)

export default function getObservable (o) { // eslint-disable-line complexity
  var obs = null
  if (o) {
  // Access foreign method only once
    var method = o[symbolObservable]
    if (typeof method === 'function') {
      obs = method.call(o)
      if (!(obs && typeof obs.subscribe === 'function')) {
        throw new TypeError('invalid observable ' + obs)
      }
    }
  }

  return obs
}
