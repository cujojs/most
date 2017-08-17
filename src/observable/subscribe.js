/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import defaultScheduler from '../scheduler/defaultScheduler'
import * as dispose from '../disposable/dispose'
import fatalError from '../fatalError'

export function subscribe (subscriber, stream) {
  if (Object(subscriber) !== subscriber) {
    throw new TypeError('subscriber must be an object')
  }

  var disposable = dispose.settable()
  var observer = new SubscribeObserver(fatalError, subscriber, disposable)

  disposable.setDisposable(stream.source.run(observer, defaultScheduler))

  return new Subscription(disposable)
}

export function SubscribeObserver (fatalError, subscriber, disposable) {
  this.fatalError = fatalError
  this.subscriber = subscriber
  this.disposable = disposable
}

SubscribeObserver.prototype.event = function (t, x) {
  if (!this.disposable.disposed && typeof this.subscriber.next === 'function') {
    this.subscriber.next(x)
  }
}

SubscribeObserver.prototype.end = function (t, x) {
  if (!this.disposable.disposed) {
    var s = this.subscriber
    var fatalError = this.fatalError
    Promise.resolve(this.disposable.dispose()).then(function () {
      if (typeof s.complete === 'function') {
        s.complete(x)
      }
    }).catch(function (e) {
      throwError(e, s.error.bind(s), fatalError)
    })
  }
}

SubscribeObserver.prototype.error = function (t, e) {
  var s = this.subscriber
  var fatalError = this.fatalError
  Promise.resolve(this.disposable.dispose()).then(function () {
    throwError(e, s.error.bind(s), fatalError)
  })
}

export function Subscription (disposable) {
  this.disposable = disposable
}

Subscription.prototype.unsubscribe = function () {
  this.disposable.dispose()
}

function throwError (e1, throw1, throw2) {
  if (typeof throw1 === 'function') {
    try {
      throw1(e1)
    } catch (e2) {
      throw2(e2)
    }
  } else {
    throw2(e1)
  }
}
