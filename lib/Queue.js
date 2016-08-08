/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

// Based on https://github.com/petkaantonov/deque

export default class Queue {
  constructor (capPow2) {
    this._capacity = capPow2 || 32
    this._length = 0
    this._head = 0
  }

  push (x) {
    const len = this._length
    this._checkCapacity(len + 1)

    const i = (this._head + len) & (this._capacity - 1)
    this[i] = x
    this._length = len + 1
  }

  shift () {
    const head = this._head
    const x = this[head]

    this[head] = void 0
    this._head = (head + 1) & (this._capacity - 1)
    this._length--
    return x
  }

  isEmpty () {
    return this._length === 0
  }

  length () {
    return this._length
  }

  _checkCapacity (size) {
    if (this._capacity < size) {
      this._ensureCapacity(this._capacity << 1)
    }
  }

  _ensureCapacity (capacity) {
    const oldCapacity = this._capacity
    this._capacity = capacity

    const last = this._head + this._length

    if (last > oldCapacity) {
      copy(this, 0, this, oldCapacity, last & (oldCapacity - 1))
    }
  }
}

function copy (src, srcIndex, dst, dstIndex, len) {
  for (let j = 0; j < len; ++j) {
    dst[j + dstIndex] = src[j + srcIndex]
    src[j + srcIndex] = void 0
  }
}
