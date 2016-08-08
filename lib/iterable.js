/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/*global Set, Symbol*/
let iteratorSymbol
// Firefox ships a partial implementation using the name @@iterator.
// https://bugzilla.mozilla.org/show_bug.cgi?id=907077#c14
if (typeof Set === 'function' && typeof new Set()['@@iterator'] === 'function') {
  iteratorSymbol = '@@iterator'
} else {
  iteratorSymbol = typeof Symbol === 'function' && Symbol.iterator ||
    '_es6shim_iterator_'
}

export const isIterable = o => typeof o[iteratorSymbol] === 'function'

export const getIterator = o => o[iteratorSymbol]()

export const makeIterable = (f, o) => {
  o[iteratorSymbol] = f
  return o
}
