/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import dispose from './disposable/dispose'
import defaultScheduler from './scheduler/defaultScheduler'

const disposeThen = (end, error, disposable, x) => Promise.resolve(disposable.dispose()).then(() => end(x), error)

const runSource = (source, scheduler, resolve, reject) => {
  const disposable = dispose.settable()
  const observer = new Drain(resolve, reject, disposable)

  disposable.setDisposable(source.run(observer, scheduler))
}

export const withScheduler = (source, scheduler) => new Promise((resolve, reject) => runSource(source, scheduler, resolve, reject))

export const withDefaultScheduler = source => withScheduler(source, defaultScheduler)

class Drain {
  constructor (end, error, disposable) {
    this._end = end
    this._error = error
    this._disposable = disposable
    this.active = true
  }

  event (t, x) {}

  end (t, x) {
    if (!this.active) {
      return
    }
    this.active = false
    disposeThen(this._end, this._error, this._disposable, x)
  }

  error (t, e) {
    this.active = false
    disposeThen(this._error, this._error, this._disposable, e)
  }
}
