/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

import defaultScheduler from '../scheduler/defaultScheduler'
import * as dispose from '../disposable/dispose'
import fatalError from '../fatalError'

export function subscribe (subscriber, stream) {
  if (subscriber == null || typeof subscriber !== 'object') {
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
  if (typeof this.subscriber.next === 'function') {
    this.subscriber.next(x)
  }
}

SubscribeObserver.prototype.end = function (t, x) {
  var s = this.subscriber
  doDispose(this.fatalError, s, s.complete, s.error, this.disposable, x)
}

SubscribeObserver.prototype.error = function (t, e) {
  var s = this.subscriber
  doDispose(this.fatalError, s, s.error, s.error, this.disposable, e)
}

export function Subscription (disposable) {
  this.disposable = disposable
}

Subscription.prototype.unsubscribe = function () {
  this.disposable.dispose()
}

function doDispose (fatal, subscriber, complete, error, disposable, x) {
  Promise.resolve(disposable.dispose()).then(function () {
    if (typeof complete === 'function') {
      complete.call(subscriber, x)
    }
  }).catch(function (e) {
    if (typeof error === 'function') {
      error.call(subscriber, e)
    }
  }).catch(fatal)
}
