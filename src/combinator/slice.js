/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import Stream from '../Stream'
import Pipe from '../sink/Pipe'
import * as core from '../source/core'
import * as dispose from '../disposable/dispose'
import Map from '../fusion/Map'

/**
 * @param {number} n
 * @param {Stream} stream
 * @returns {Stream} new stream containing only up to the first n items from stream
 */
export function take (n, stream) {
  return slice(0, n, stream)
}

/**
 * @param {number} n
 * @param {Stream} stream
 * @returns {Stream} new stream with the first n items removed
 */
export function skip (n, stream) {
  return slice(n, Infinity, stream)
}

/**
 * Slice a stream by index. Negative start/end indexes are not supported
 * @param {number} start
 * @param {number} end
 * @param {Stream} stream
 * @returns {Stream} stream containing items where start <= index < end
 */
export function slice (start, end, stream) {
  return end <= start ? core.empty()
    : new Stream(sliceSource(start, end, stream.source))
}

function sliceSource (start, end, source) {
  return source instanceof Map ? commuteMapSlice(start, end, source)
    : source instanceof Slice ? fuseSlice(start, end, source)
    : new Slice(start, end, source)
}

function commuteMapSlice (start, end, source) {
  return Map.create(source.f, sliceSource(start, end, source.source))
}

function fuseSlice (start, end, source) {
  start += source.min
  end = Math.min(end + source.min, source.max)
  return new Slice(start, end, source.source)
}

function Slice (min, max, source) {
  this.source = source
  this.min = min
  this.max = max
}

Slice.prototype.run = function (sink, scheduler) {
  return new SliceSink(this.min, this.max - this.min, this.source, sink, scheduler)
}

function SliceSink (skip, take, source, sink, scheduler) {
  this.sink = sink
  this.skip = skip
  this.take = take
  this.disposable = dispose.once(source.run(this, scheduler))
}

SliceSink.prototype.end = Pipe.prototype.end
SliceSink.prototype.error = Pipe.prototype.error

SliceSink.prototype.event = function (t, x) { // eslint-disable-line complexity
  if (this.skip > 0) {
    this.skip -= 1
    return
  }

  if (this.take === 0) {
    return
  }

  this.take -= 1
  this.sink.event(t, x)
  if (this.take === 0) {
    this.dispose()
    this.sink.end(t, x)
  }
}

SliceSink.prototype.dispose = function () {
  return this.disposable.dispose()
}

export function takeWhile (p, stream) {
  return new Stream(new TakeWhile(p, stream.source))
}

function TakeWhile (p, source) {
  this.p = p
  this.source = source
}

TakeWhile.prototype.run = function (sink, scheduler) {
  return new TakeWhileSink(this.p, this.source, sink, scheduler)
}

function TakeWhileSink (p, source, sink, scheduler) {
  this.p = p
  this.sink = sink
  this.active = true
  this.disposable = dispose.once(source.run(this, scheduler))
}

TakeWhileSink.prototype.end = Pipe.prototype.end
TakeWhileSink.prototype.error = Pipe.prototype.error

TakeWhileSink.prototype.event = function (t, x) {
  if (!this.active) {
    return
  }

  var p = this.p
  this.active = p(x)
  if (this.active) {
    this.sink.event(t, x)
  } else {
    this.dispose()
    this.sink.end(t, x)
  }
}

TakeWhileSink.prototype.dispose = function () {
  return this.disposable.dispose()
}

export function skipWhile (p, stream) {
  return new Stream(new SkipWhile(p, stream.source))
}

function SkipWhile (p, source) {
  this.p = p
  this.source = source
}

SkipWhile.prototype.run = function (sink, scheduler) {
  return this.source.run(new SkipWhileSink(this.p, sink), scheduler)
}

function SkipWhileSink (p, sink) {
  this.p = p
  this.sink = sink
  this.skipping = true
}

SkipWhileSink.prototype.end = Pipe.prototype.end
SkipWhileSink.prototype.error = Pipe.prototype.error

SkipWhileSink.prototype.event = function (t, x) {
  if (this.skipping) {
    var p = this.p
    this.skipping = p(x)
    if (this.skipping) {
      return
    }
  }

  this.sink.event(t, x)
}
