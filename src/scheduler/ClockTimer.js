/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import { defer } from '../task'

/* global setTimeout, clearTimeout */

export default function ClockTimer () {}

ClockTimer.prototype.now = Date.now

ClockTimer.prototype.setTimer = function (f, dt) {
  return dt <= 0 ? runAsap(f) : setTimeout(f, dt)
}

ClockTimer.prototype.clearTimer = function (t) {
  return t instanceof Asap ? t.cancel() : clearTimeout(t)
}

function Asap (f) {
  this.f = f
  this.active = true
}

Asap.prototype.run = function () {
  return this.active && this.f()
}

Asap.prototype.error = function (e) {
  throw e
}

Asap.prototype.cancel = function () {
  this.active = false
}

function runAsap (f) {
  var task = new Asap(f)
  defer(task)
  return task
}
