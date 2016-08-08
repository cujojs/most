(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@most/prelude'), require('symbol-observable'), require('@most/multicast')) :
  typeof define === 'function' && define.amd ? define(['exports', '@most/prelude', 'symbol-observable', '@most/multicast'], factory) :
  (factory((global.most = global.most || {}),global.mostPrelude,global.symbolObservable,global.mostMulticast));
}(this, function (exports,require$$0,require$$31,require$$0$1) { 'use strict';

  function interopDefault(ex) {
  	return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream$1 = function Stream (source) {
    this.source = source
  };



  var require$$6 = Object.freeze({
    default: Stream$1
  });

  var Disposable = createCommonjsModule(function (module) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  module.exports = Disposable;

  /**
   * Create a new Disposable which will dispose its underlying resource.
   * @param {function} dispose function
   * @param {*?} data any data to be passed to disposer function
   * @constructor
   */
  function Disposable(dispose, data) {
  	this._dispose = dispose;
  	this._data = data;
  }

  Disposable.prototype.dispose = function() {
  	return this._dispose(this._data);
  };
  });

  var Disposable$1 = interopDefault(Disposable);


  var require$$3$1 = Object.freeze({
  	default: Disposable$1
  });

  var SettableDisposable = createCommonjsModule(function (module) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  module.exports = SettableDisposable;

  function SettableDisposable() {
  	this.disposable = void 0;
  	this.disposed = false;
  	this._resolve = void 0;

  	var self = this;
  	this.result = new Promise(function(resolve) {
  		self._resolve = resolve;
  	});
  }

  SettableDisposable.prototype.setDisposable = function(disposable) {
  	if(this.disposable !== void 0) {
  		throw new Error('setDisposable called more than once');
  	}

  	this.disposable = disposable;

  	if(this.disposed) {
  		this._resolve(disposable.dispose());
  	}
  };

  SettableDisposable.prototype.dispose = function() {
  	if(this.disposed) {
  		return this.result;
  	}

  	this.disposed = true;

  	if(this.disposable !== void 0) {
  		this.result = this.disposable.dispose();
  	}

  	return this.result;
  };
  });

  var SettableDisposable$1 = interopDefault(SettableDisposable);


  var require$$2 = Object.freeze({
  	default: SettableDisposable$1
  });

  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var isPromise = function (p) { return p !== null && typeof p === 'object' && typeof p.then === 'function'; }


  var require$$1 = Object.freeze({
  	isPromise: isPromise
  });

  var dispose = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Disposable = interopDefault(require$$3$1);
  var SettableDisposable = interopDefault(require$$2);
  var isPromise = interopDefault(require$$1).isPromise;
  var base = interopDefault(require$$0);

  var map = base.map;
  var identity = base.id;

  exports.tryDispose = tryDispose;
  exports.create = create;
  exports.once = once;
  exports.empty = empty;
  exports.all = all;
  exports.settable = settable;
  exports.promised = promised;

  /**
   * Call disposable.dispose.  If it returns a promise, catch promise
   * error and forward it through the provided sink.
   * @param {number} t time
   * @param {{dispose: function}} disposable
   * @param {{error: function}} sink
   * @return {*} result of disposable.dispose
   */
  function tryDispose(t, disposable, sink) {
  	var result = disposeSafely(disposable);
  	return isPromise(result)
  		? result.catch(function (e) {
  			sink.error(t, e);
  		})
  		: result;
  }

  /**
   * Create a new Disposable which will dispose its underlying resource
   * at most once.
   * @param {function} dispose function
   * @param {*?} data any data to be passed to disposer function
   * @return {Disposable}
   */
  function create(dispose, data) {
  	return once(new Disposable(dispose, data));
  }

  /**
   * Create a noop disposable. Can be used to satisfy a Disposable
   * requirement when no actual resource needs to be disposed.
   * @return {Disposable|exports|module.exports}
   */
  function empty() {
  	return new Disposable(identity, void 0);
  }

  /**
   * Create a disposable that will dispose all input disposables in parallel.
   * @param {Array<Disposable>} disposables
   * @return {Disposable}
   */
  function all(disposables) {
  	return create(disposeAll, disposables);
  }

  function disposeAll(disposables) {
  	return Promise.all(map(disposeSafely, disposables));
  }

  function disposeSafely(disposable) {
  	try {
  		return disposable.dispose();
  	} catch(e) {
  		return Promise.reject(e);
  	}
  }

  /**
   * Create a disposable from a promise for another disposable
   * @param {Promise<Disposable>} disposablePromise
   * @return {Disposable}
   */
  function promised(disposablePromise) {
  	return create(disposePromise, disposablePromise);
  }

  function disposePromise(disposablePromise) {
  	return disposablePromise.then(disposeOne);
  }

  function disposeOne(disposable) {
  	return disposable.dispose();
  }

  /**
   * Create a disposable proxy that allows its underlying disposable to
   * be set later.
   * @return {SettableDisposable}
   */
  function settable() {
  	return new SettableDisposable();
  }

  /**
   * Wrap an existing disposable (which may not already have been once()d)
   * so that it will only dispose its underlying resource at most once.
   * @param {{ dispose: function() }} disposable
   * @return {Disposable} wrapped disposable
   */
  function once(disposable) {
  	return new Disposable(disposeMemoized, memoized(disposable));
  }

  function disposeMemoized(memoized) {
  	if(!memoized.disposed) {
  		memoized.disposed = true;
  		memoized.value = disposeSafely(memoized.disposable);
  		memoized.disposable = void 0;
  	}

  	return memoized.value;
  }

  function memoized(disposable) {
  	return { disposed: false, disposable: disposable, value: void 0 };
  }
  });

  var dispose$1 = interopDefault(dispose);
  var promised = dispose.promised;
  var settable = dispose.settable;
  var all = dispose.all;
  var empty$2 = dispose.empty;
  var once = dispose.once;
  var create = dispose.create;
  var tryDispose = dispose.tryDispose;

var require$$3 = Object.freeze({
  	default: dispose$1,
  	promised: promised,
  	settable: settable,
  	all: all,
  	empty: empty$2,
  	once: once,
  	create: create,
  	tryDispose: tryDispose
  });

  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var fatalError = function (err) { return setTimeout(function () { throw err }, 0); }


  var require$$1$1 = Object.freeze({
  	fatalError: fatalError
  });

  var PropagateTask = createCommonjsModule(function (module) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var fatal = interopDefault(require$$1$1);

  module.exports = PropagateTask;

  function PropagateTask(run, value, sink) {
  	this._run = run;
  	this.value = value;
  	this.sink = sink;
  	this.active = true;
  }

  PropagateTask.event = function(value, sink) {
  	return new PropagateTask(emit, value, sink);
  };

  PropagateTask.end = function(value, sink) {
  	return new PropagateTask(end, value, sink);
  };

  PropagateTask.error = function(value, sink) {
  	return new PropagateTask(error, value, sink);
  };

  PropagateTask.prototype.dispose = function() {
  	this.active = false;
  };

  PropagateTask.prototype.run = function(t) {
  	if(!this.active) {
  		return;
  	}
  	this._run(t, this.value, this.sink);
  };

  PropagateTask.prototype.error = function(t, e) {
  	if(!this.active) {
  		return fatal(e);
  	}
  	this.sink.error(t, e);
  };

  function error(t, e, sink) {
  	sink.error(t, e);
  }

  function emit(t, x, sink) {
  	sink.event(t, x);
  }

  function end(t, x, sink) {
  	sink.end(t, x);
  }
  });

  var PropagateTask$1 = interopDefault(PropagateTask);


  var require$$0$3 = Object.freeze({
  	default: PropagateTask$1
  });

  var core = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);
  var dispose = interopDefault(require$$3);
  var PropagateTask = interopDefault(require$$0$3);

  exports.of = streamOf;
  exports.empty = empty;
  exports.never = never;

  /**
   * Stream containing only x
   * @param {*} x
   * @returns {Stream}
   */
   function streamOf(x) {
   	return new Stream(new Just(x));
   }

   function Just(x) {
   	this.value = x;
   }

   Just.prototype.run = function(sink, scheduler) {
   	return scheduler.asap(new PropagateTask(runJust, this.value, sink));
   };

   function runJust(t, x, sink) {
   	sink.event(t, x);
   	sink.end(t, void 0);
   }

  /**
   * Stream containing no events and ends immediately
   * @returns {Stream}
   */
  function empty() {
  	return EMPTY;
  }

  function EmptySource() {}

  EmptySource.prototype.run = function(sink, scheduler) {
  	var task = PropagateTask.end(void 0, sink);
  	scheduler.asap(task);

  	return dispose.create(disposeEmpty, task);
  };

  function disposeEmpty(task) {
  	return task.dispose();
  }

  var EMPTY = new Stream(new EmptySource());

  /**
   * Stream containing no events and never ends
   * @returns {Stream}
   */
  function never() {
  	return NEVER;
  }

  function NeverSource() {}

  NeverSource.prototype.run = function() {
  	return dispose.empty();
  };

  var NEVER = new Stream(new NeverSource());
  });

  var core$1 = interopDefault(core);
  var never$1 = core.never;
  var empty$1 = core.empty;
  var of$1 = core.of;

var require$$0$2 = Object.freeze({
  	default: core$1,
  	never: never$1,
  	empty: empty$1,
  	of: of$1
  });

  var fromArray = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);
  var PropagateTask = interopDefault(require$$0$3);

  exports.fromArray = fromArray;

  function fromArray (a) {
  	return new Stream(new ArraySource(a));
  }

  function ArraySource(a) {
  	this.array = a;
  }

  ArraySource.prototype.run = function(sink, scheduler) {
  	return scheduler.asap(new PropagateTask(runProducer, this.array, sink));
  };

  function runProducer(t, array, sink) {
  	for(var i=0, l=array.length; i<l && this.active; ++i) {
  		sink.event(t, array[i]);
  	}

  	this.active && end(t);

  	function end(t) {
  		sink.end(t);
  	}
  }
  });

  var fromArray$1 = interopDefault(fromArray);
  var fromArray$$1 = fromArray.fromArray;


  var require$$5 = Object.freeze({
  	default: fromArray$1,
  	fromArray: fromArray$$1
  });

  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  /*global Set, Symbol*/
  var iteratorSymbol
  // Firefox ships a partial implementation using the name @@iterator.
  // https://bugzilla.mozilla.org/show_bug.cgi?id=907077#c14
  if (typeof Set === 'function' && typeof new Set()['@@iterator'] === 'function') {
    iteratorSymbol = '@@iterator'
  } else {
    iteratorSymbol = typeof Symbol === 'function' && Symbol.iterator ||
      '_es6shim_iterator_'
  }

  var isIterable = function (o) { return typeof o[iteratorSymbol] === 'function'; }

  var getIterator = function (o) { return o[iteratorSymbol](); }

  var makeIterable = function (f, o) {
    o[iteratorSymbol] = f
    return o
  }


  var require$$1$2 = Object.freeze({
    isIterable: isIterable,
    getIterator: getIterator,
    makeIterable: makeIterable
  });

  var fromIterable = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);
  var getIterator = interopDefault(require$$1$2).getIterator;
  var PropagateTask = interopDefault(require$$0$3);

  exports.fromIterable = fromIterable;

  function fromIterable(iterable) {
  	return new Stream(new IterableSource(iterable));
  }

  function IterableSource(iterable) {
  	this.iterable = iterable;
  }

  IterableSource.prototype.run = function(sink, scheduler) {
  	return new IteratorProducer(getIterator(this.iterable), sink, scheduler);
  };

  function IteratorProducer(iterator, sink, scheduler) {
  	this.scheduler = scheduler;
  	this.iterator = iterator;
  	this.task = new PropagateTask(runProducer, this, sink);
  	scheduler.asap(this.task);
  }

  IteratorProducer.prototype.dispose = function() {
  	return this.task.dispose();
  };

  function runProducer(t, producer, sink) {
  	var x = producer.iterator.next();
  	if(x.done) {
  		sink.end(t, x.value);
  	} else {
  		sink.event(t, x.value);
  	}

  	producer.scheduler.asap(producer.task);
  }
  });

  var fromIterable$1 = interopDefault(fromIterable);
  var fromIterable$$1 = fromIterable.fromIterable;


  var require$$3$2 = Object.freeze({
  	default: fromIterable$1,
  	fromIterable: fromIterable$$1
  });

  var getObservable = createCommonjsModule(function (module) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var symbolObservable = interopDefault(require$$31).default;

  module.exports = getObservable;

  function getObservable(o) {
  	var obs = null;
  	if(o) {
  		// Access foreign method only once
  		var method = o[symbolObservable];
  		if(typeof method === 'function') {
  			obs = method.call(o);
  			if(!(obs && typeof obs.subscribe === 'function')) {
  				throw new TypeError('invalid observable ' + obs);
  			}
  		}
  	}

  	return obs;
  }
  });

  var getObservable$1 = interopDefault(getObservable);


  var require$$2$1 = Object.freeze({
  	default: getObservable$1
  });

  var fromObservable = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);
  var dispose = interopDefault(require$$3);

  exports.fromObservable = fromObservable;
  exports.ObservableSource = ObservableSource;
  exports.SubscriberSink = SubscriberSink;

  function fromObservable(observable) {
  	return new Stream(new ObservableSource(observable));
  }

  function ObservableSource(observable) {
  	this.observable = observable;
  }

  ObservableSource.prototype.run = function(sink, scheduler) {
  	var sub = this.observable.subscribe(new SubscriberSink(sink, scheduler));
  	if(typeof sub === 'function') {
  		return dispose.create(sub);
  	} else if(sub && typeof sub.unsubscribe === 'function') {
  		return dispose.create(unsubscribe, sub);
  	}

  	throw new TypeError('Observable returned invalid subscription ' + String(sub));
  }

  function SubscriberSink(sink, scheduler) {
  	this.sink = sink;
  	this.scheduler = scheduler;
  }

  SubscriberSink.prototype.next = function(x) {
  	this.sink.event(this.scheduler.now(), x);
  }

  SubscriberSink.prototype.complete = function(x) {
  	this.sink.end(this.scheduler.now(), x);
  }

  SubscriberSink.prototype.error = function(e) {
  	this.sink.error(this.scheduler.now(), e);
  }

  function unsubscribe(subscription) {
  	return subscription.unsubscribe();
  }
  });

  var fromObservable$1 = interopDefault(fromObservable);
  var SubscriberSink = fromObservable.SubscriberSink;
  var ObservableSource = fromObservable.ObservableSource;
  var fromObservable$$1 = fromObservable.fromObservable;


  var require$$1$3 = Object.freeze({
  	default: fromObservable$1,
  	SubscriberSink: SubscriberSink,
  	ObservableSource: ObservableSource,
  	fromObservable: fromObservable$$1
  });

  var from$1 = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);
  var fromArray = interopDefault(require$$5).fromArray;
  var isIterable = interopDefault(require$$1$2).isIterable;
  var fromIterable = interopDefault(require$$3$2).fromIterable;
  var getObservable = interopDefault(require$$2$1);
  var fromObservable = interopDefault(require$$1$3).fromObservable;
  var isArrayLike = interopDefault(require$$0).isArrayLike;

  exports.from = from;

  function from(a) { // eslint-disable-line complexity
  	if(a instanceof Stream) {
  		return a;
  	}

  	var observable = getObservable(a);
  	if(observable != null) {
  		return fromObservable(observable);
  	}

  	if(Array.isArray(a) || isArrayLike(a)) {
  		return fromArray(a);
  	}

  	if(isIterable(a)) {
  		return fromIterable(a);
  	}

  	throw new TypeError('from(x) must be observable, iterable, or array-like: ' + a);
  }
  });

  var from$2 = interopDefault(from$1);
  var from$$1 = from$1.from;


  var require$$33 = Object.freeze({
  	default: from$2,
  	from: from$$1
  });

  var periodic$1 = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);
  var dispose = interopDefault(require$$3);
  var PropagateTask = interopDefault(require$$0$3);

  exports.periodic = periodic;

  /**
   * Create a stream that emits the current time periodically
   * @param {Number} period periodicity of events in millis
   * @param {*} value value to emit each period
   * @returns {Stream} new stream that emits the current time every period
   */
  function periodic(period, value) {
  	return new Stream(new Periodic(period, value));
  }

  function Periodic(period, value) {
  	this.period = period;
  	this.value = value;
  }

  Periodic.prototype.run = function(sink, scheduler) {
  	return scheduler.periodic(this.period, PropagateTask.event(this.value, sink));
  };
  });

  var periodic$2 = interopDefault(periodic$1);
  var periodic$$1 = periodic$1.periodic;


  var require$$32 = Object.freeze({
  	default: periodic$2,
  	periodic: periodic$$1
  });

  var ScheduledTask = createCommonjsModule(function (module) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  module.exports = ScheduledTask;

  function ScheduledTask(delay, period, task, scheduler) {
  	this.time = delay;
  	this.period = period;
  	this.task = task;
  	this.scheduler = scheduler;
  	this.active = true;
  }

  ScheduledTask.prototype.run = function() {
  	return this.task.run(this.time);
  };

  ScheduledTask.prototype.error = function(e) {
  	return this.task.error(this.time, e);
  };

  ScheduledTask.prototype.dispose = function() {
  	this.scheduler.cancel(this);
  	return this.task.dispose();
  };
  });

  var ScheduledTask$1 = interopDefault(ScheduledTask);


  var require$$2$3 = Object.freeze({
  	default: ScheduledTask$1
  });

  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var defer = function (task) { return Promise.resolve(task).then(runTask); }

  var runTask = function (task) {
    try {
      return task.run()
    } catch(e) {
      return task.error(e)
    }
  }


  var require$$0$4 = Object.freeze({
    defer: defer,
    runTask: runTask
  });

  var Timeline = createCommonjsModule(function (module) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var base = interopDefault(require$$0);

  module.exports = Timeline;

  function Timeline() {
  	this.tasks = [];
  }

  Timeline.prototype.nextArrival = function() {
  	return this.isEmpty() ? Infinity : this.tasks[0].time;
  }

  Timeline.prototype.isEmpty = function() {
  	return this.tasks.length === 0;
  }

  Timeline.prototype.add = function(st) {
  	insertByTime(st, this.tasks);
  }

  Timeline.prototype.remove = function(st) {
  	var i = binarySearch(st.time, this.tasks);

  	if(i >= 0 && i < this.tasks.length) {
  		var at = base.findIndex(st, this.tasks[i].events);
  		if(at >= 0) {
  			this.tasks[i].events.splice(at, 1);
  			return true;
  		}
  	}

  	return false;
  }

  Timeline.prototype.removeAll = function(f) {
  	var this$1 = this;

  	for(var i = 0, l = this.tasks.length; i < l; ++i) {
  		removeAllFrom(f, this$1.tasks[i]);
  	}
  };

  Timeline.prototype.runTasks = function(t, runTask) {
  	var this$1 = this;

  	var tasks = this.tasks;
  	var l = tasks.length;
  	var i = 0;

  	while(i < l && tasks[i].time <= t) {
  		++i;
  	}

  	this.tasks = tasks.slice(i);

  	// Run all ready tasks
  	for (var j = 0; j < i; ++j) {
  		this$1.tasks = runTasks(runTask, tasks[j], this$1.tasks);
  	}
  }

  function runTasks(runTask, timeslot, tasks) {
  	var events = timeslot.events;
  	for(var i=0; i<events.length; ++i) {
  		var task = events[i];

  		if(task.active) {
  			runTask(task);

  			// Reschedule periodic repeating tasks
  			// Check active again, since a task may have canceled itself
  			if(task.period >= 0 && task.active) {
  				task.time = task.time + task.period;
  				insertByTime(task, tasks);
  			}
  		}
  	}

  	return tasks;
  }

  function insertByTime(task, timeslots) {
  	var l = timeslots.length;

  	if(l === 0) {
  		timeslots.push(newTimeslot(task.time, [task]));
  		return;
  	}

  	var i = binarySearch(task.time, timeslots);

  	if(i >= l) {
  		timeslots.push(newTimeslot(task.time, [task]));
  	} else if(task.time === timeslots[i].time) {
  		timeslots[i].events.push(task);
  	} else {
  		timeslots.splice(i, 0, newTimeslot(task.time, [task]));
  	}
  }

  function removeAllFrom(f, timeslot) {
  	timeslot.events = base.removeAll(f, timeslot.events);
  }

  function binarySearch(t, sortedArray) {
  	var lo = 0;
  	var hi = sortedArray.length;
  	var mid, y;

  	while (lo < hi) {
  		mid = Math.floor((lo + hi) / 2);
  		y = sortedArray[mid];

  		if (t === y.time) {
  			return mid;
  		} else if (t < y.time) {
  			hi = mid;
  		} else {
  			lo = mid + 1;
  		}
  	}
  	return hi;
  }

  function newTimeslot(t, events) {
  	return { time: t, events: events };
  }
  });

  var Timeline$1 = interopDefault(Timeline);


  var require$$0$5 = Object.freeze({
  	default: Timeline$1
  });

  var Scheduler = createCommonjsModule(function (module) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var base = interopDefault(require$$0);
  var ScheduledTask = interopDefault(require$$2$3);
  var runTask = interopDefault(require$$0$4).runTask;
  var Timeline = interopDefault(require$$0$5);

  module.exports = Scheduler;

  function Scheduler(timer, timeline) {
  	this.timer = timer;
  	this.timeline = timeline;

  	this._timer = null;
  	this._nextArrival = Infinity;

  	var self = this;
  	this._runReadyTasksBound = function() {
  		self._runReadyTasks(self.now());
  	};
  }

  Scheduler.prototype.now = function() {
  	return this.timer.now();
  };

  Scheduler.prototype.asap = function(task) {
  	return this.schedule(0, -1, task);
  };

  Scheduler.prototype.delay = function(delay, task) {
  	return this.schedule(delay, -1, task);
  };

  Scheduler.prototype.periodic = function(period, task) {
  	return this.schedule(0, period, task);
  };

  Scheduler.prototype.schedule = function(delay, period, task) {
  	var now = this.now();
  	var st = new ScheduledTask(now + Math.max(0, delay), period, task, this);

  	this.timeline.add(st);
  	this._scheduleNextRun(now);
  	return st;
  };

  Scheduler.prototype.cancel = function(task) {
  	task.active = false;
  	if(this.timeline.remove(task)) {
  		this._reschedule();
  	}
  };

  Scheduler.prototype.cancelAll = function(f) {
  	this.timeline.removeAll(f);
  	this._reschedule();
  }

  Scheduler.prototype._reschedule = function() {
  	if(this.timeline.isEmpty()) {
  		this._unschedule();
  	} else {
  		this._scheduleNextRun(this.now());
  	}
  };

  Scheduler.prototype._unschedule = function() {
  	this.timer.clearTimer(this._timer);
  	this._timer = null;
  };

  Scheduler.prototype._scheduleNextRun = function(now) {
  	if(this.timeline.isEmpty()) {
  		return;
  	}

  	var nextArrival = this.timeline.nextArrival();

  	if(this._timer === null) {
  		this._scheduleNextArrival(nextArrival, now);
  	} else if(nextArrival < this._nextArrival) {
  		this._unschedule();
  		this._scheduleNextArrival(nextArrival, now);
  	}
  };

  Scheduler.prototype._scheduleNextArrival = function(nextArrival, now) {
  	this._nextArrival = nextArrival;
  	var delay = Math.max(0, nextArrival - now);
  	this._timer = this.timer.setTimer(this._runReadyTasksBound, delay);
  };

  Scheduler.prototype._runReadyTasks = function(now) {
  	this._timer = null;
  	this.timeline.runTasks(now, runTask)
  	this._scheduleNextRun(this.now());
  };
  });

  var Scheduler$1 = interopDefault(Scheduler);


  var require$$2$2 = Object.freeze({
  	default: Scheduler$1
  });

  var ClockTimer = createCommonjsModule(function (module) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var defer = interopDefault(require$$0$4).defer;

  /*global setTimeout, clearTimeout*/

  module.exports = ClockTimer;

  function ClockTimer() {}

  ClockTimer.prototype.now = Date.now;

  ClockTimer.prototype.setTimer = function(f, dt) {
  	return dt <= 0 ? runAsap(f) : setTimeout(f, dt);
  };

  ClockTimer.prototype.clearTimer = function(t) {
  	return t instanceof Asap ? t.cancel() : clearTimeout(t);
  };

  function Asap(f) {
  	this.f = f;
  	this.active = true;
  }

  Asap.prototype.run = function() {
  	return this.active && this.f();
  };

  Asap.prototype.error = function(e) {
  	throw e;
  };

  Asap.prototype.cancel = function() {
  	this.active = false;
  };

  function runAsap(f) {
  	var task = new Asap(f);
  	defer(task);
  	return task;
  }
  });

  var ClockTimer$1 = interopDefault(ClockTimer);


  var require$$1$5 = Object.freeze({
  	default: ClockTimer$1
  });

  var defaultScheduler = createCommonjsModule(function (module) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Scheduler = interopDefault(require$$2$2);
  var ClockTimer = interopDefault(require$$1$5);
  var Timeline = interopDefault(require$$0$5);

  module.exports = new Scheduler(new ClockTimer(), new Timeline());
  });

  var defaultScheduler$1 = interopDefault(defaultScheduler);


  var require$$1$4 = Object.freeze({
  	default: defaultScheduler$1
  });

  var subscribe = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var defaultScheduler = interopDefault(require$$1$4);
  var dispose = interopDefault(require$$3);
  var fatalError = interopDefault(require$$1$1);

  exports.subscribe = subscribe;
  exports.SubscribeObserver = SubscribeObserver;
  exports.Subscription = Subscription;

  function subscribe(subscriber, stream) {
  	if(subscriber == null || typeof subscriber !== 'object') {
  		throw new TypeError('subscriber must be an object');
  	}

  	var disposable = dispose.settable();
  	var observer = new SubscribeObserver(fatalError, subscriber, disposable);

  	disposable.setDisposable(stream.source.run(observer, defaultScheduler));

  	return new Subscription(disposable);
  }

  function SubscribeObserver(fatalError, subscriber, disposable) {
  	this.fatalError = fatalError;
  	this.subscriber = subscriber;
  	this.disposable = disposable;
  }

  SubscribeObserver.prototype.event = function(t, x) {
  	if(typeof this.subscriber.next === 'function') {
  		this.subscriber.next(x);
  	}
  };

  SubscribeObserver.prototype.end = function(t, x) {
  	var s = this.subscriber;
  	doDispose(this.fatalError, s, s.complete, s.error, this.disposable, x);
  };

  SubscribeObserver.prototype.error = function(t, e) {
  	var s = this.subscriber;
  	doDispose(this.fatalError, s, s.error, s.error, this.disposable, e);
  };

  function Subscription(disposable) {
  	this.disposable = disposable;
  }

  Subscription.prototype.unsubscribe = function() {
  	this.disposable.dispose();
  }

  function doDispose(fatal, subscriber, complete, error, disposable, x) {
  	Promise.resolve(disposable.dispose()).then(function () {
  		if(typeof complete === 'function') {
  			complete.call(subscriber, x);
  		}
  	}).catch(function(e) {
  		if(typeof error === 'function') {
  			error.call(subscriber, e);
  		}
  	}).catch(fatal);
  }
  });

  var subscribe$1 = interopDefault(subscribe);
  var Subscription = subscribe.Subscription;
  var SubscribeObserver = subscribe.SubscribeObserver;
  var subscribe$$1 = subscribe.subscribe;


  var require$$30 = Object.freeze({
  	default: subscribe$1,
  	Subscription: Subscription,
  	SubscribeObserver: SubscribeObserver,
  	subscribe: subscribe$$1
  });

  var thru = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  exports.thru = function thru(f, stream) {
  	return f(stream);
  }
  });

  var thru$1 = interopDefault(thru);
  var thru$$1 = thru.thru;


  var require$$29 = Object.freeze({
  	default: thru$1,
  	thru: thru$$1
  });

  var tryEvent = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  exports.tryEvent = tryEvent;
  exports.tryEnd = tryEnd;

  function tryEvent(t, x, sink) {
  	try {
  		sink.event(t, x);
  	} catch(e) {
  		sink.error(t, e);
  	}
  }

  function tryEnd(t, x, sink) {
  	try {
  		sink.end(t, x);
  	} catch(e) {
  		sink.error(t, e);
  	}
  }
  });

  var tryEvent$1 = interopDefault(tryEvent);
  var tryEnd = tryEvent.tryEnd;
  var tryEvent$$1 = tryEvent.tryEvent;


  var require$$2$4 = Object.freeze({
  	default: tryEvent$1,
  	tryEnd: tryEnd,
  	tryEvent: tryEvent$$1
  });

  var EventTargetSource = createCommonjsModule(function (module) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var dispose = interopDefault(require$$3);
  var tryEvent = interopDefault(require$$2$4);

  module.exports = EventTargetSource;

  function EventTargetSource(event, source, capture) {
  	this.event = event;
  	this.source = source;
  	this.capture = capture;
  }

  EventTargetSource.prototype.run = function(sink, scheduler) {
  	function addEvent(e) {
  		tryEvent.tryEvent(scheduler.now(), e, sink);
  	}

  	this.source.addEventListener(this.event, addEvent, this.capture);

  	return dispose.create(disposeEventTarget,
  		{ target: this, addEvent: addEvent });
  };

  function disposeEventTarget(info) {
  	var target = info.target;
  	target.source.removeEventListener(target.event, info.addEvent, target.capture);
  }
  });

  var EventTargetSource$1 = interopDefault(EventTargetSource);


  var require$$1$6 = Object.freeze({
  	default: EventTargetSource$1
  });

  var DeferredSink = createCommonjsModule(function (module) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var defer = interopDefault(require$$0$4).defer;

  module.exports = DeferredSink;

  function DeferredSink(sink) {
  	this.sink = sink;
  	this.events = [];
  	this.active = true;
  }

  DeferredSink.prototype.event = function(t, x) {
  	if(!this.active) {
  		return;
  	}

  	if(this.events.length === 0) {
  		defer(new PropagateAllTask(this.sink, t, this.events));
  	}

  	this.events.push({ time: t, value: x });
  };

  DeferredSink.prototype.end = function(t, x) {
  	if(!this.active) {
  		return;
  	}

  	this._end(new EndTask(t, x, this.sink));
  };

  DeferredSink.prototype.error = function(t, e) {
  	this._end(new ErrorTask(t, e, this.sink));
  };

  DeferredSink.prototype._end = function(task) {
  	this.active = false;
  	defer(task);
  }

  function PropagateAllTask(sink, time, events) {
  	this.sink = sink;
  	this.events = events;
  	this.time = time;
  }

  PropagateAllTask.prototype.run = function() {
  	var this$1 = this;

  	var events = this.events;
  	var sink = this.sink;
  	var event;

  	for(var i = 0, l = events.length; i<l; ++i) {
  		event = events[i];
  		this$1.time = event.time;
  		sink.event(event.time, event.value);
  	}

  	events.length = 0;
  };

  PropagateAllTask.prototype.error = function(e) {
  	this.sink.error(this.time, e);
  };

  function EndTask(t, x, sink) {
  	this.time = t;
  	this.value = x;
  	this.sink = sink;
  }

  EndTask.prototype.run = function() {
  	this.sink.end(this.time, this.value);
  };

  EndTask.prototype.error = function(e) {
  	this.sink.error(this.time, e);
  };

  function ErrorTask(t, e, sink) {
  	this.time = t;
  	this.value = e;
  	this.sink = sink;
  }

  ErrorTask.prototype.run = function() {
  	this.sink.error(this.time, this.value);
  };

  ErrorTask.prototype.error = function(e) {
  	throw e;
  };
  });

  var DeferredSink$1 = interopDefault(DeferredSink);


  var require$$2$5 = Object.freeze({
  	default: DeferredSink$1
  });

  var EventEmitterSource = createCommonjsModule(function (module) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var DeferredSink = interopDefault(require$$2$5);
  var dispose = interopDefault(require$$3);
  var tryEvent = interopDefault(require$$2$4);

  module.exports = EventEmitterSource;

  function EventEmitterSource(event, source) {
  	this.event = event;
  	this.source = source;
  }

  EventEmitterSource.prototype.run = function(sink, scheduler) {
  	// NOTE: Because EventEmitter allows events in the same call stack as
  	// a listener is added, use a DeferredSink to buffer events
  	// until the stack clears, then propagate.  This maintains most.js's
  	// invariant that no event will be delivered in the same call stack
  	// as an observer begins observing.
  	var dsink = new DeferredSink(sink);

  	function addEventVariadic(a) {
  		var arguments$1 = arguments;

  		var l = arguments.length;
  		if(l > 1) {
  			var arr = new Array(l);
  			for(var i=0; i<l; ++i) {
  				arr[i] = arguments$1[i];
  			}
  			tryEvent.tryEvent(scheduler.now(), arr, dsink);
  		} else {
  			tryEvent.tryEvent(scheduler.now(), a, dsink);
  		}
  	}

  	this.source.addListener(this.event, addEventVariadic);

  	return dispose.create(disposeEventEmitter, { target: this, addEvent: addEventVariadic });
  };

  function disposeEventEmitter(info) {
  	var target = info.target;
  	target.source.removeListener(target.event, info.addEvent);
  }
  });

  var EventEmitterSource$1 = interopDefault(EventEmitterSource);


  var require$$0$6 = Object.freeze({
  	default: EventEmitterSource$1
  });

  var fromEvent$1 = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);
  var EventTargetSource = interopDefault(require$$1$6);
  var EventEmitterSource = interopDefault(require$$0$6);

  exports.fromEvent = fromEvent;

  /**
   * Create a stream from an EventTarget, such as a DOM Node, or EventEmitter.
   * @param {String} event event type name, e.g. 'click'
   * @param {EventTarget|EventEmitter} source EventTarget or EventEmitter
   * @param {*?} capture for DOM events, whether to use
   *  capturing--passed as 3rd parameter to addEventListener.
   * @returns {Stream} stream containing all events of the specified type
   * from the source.
   */
  function fromEvent(event, source, capture) {
  	var s;

  	if(typeof source.addEventListener === 'function' && typeof source.removeEventListener === 'function') {
  		if(arguments.length < 3) {
  			capture = false
  		}

  		s = new EventTargetSource(event, source, capture);
  	} else if(typeof source.addListener === 'function' && typeof source.removeListener === 'function') {
  		s = new EventEmitterSource(event, source);
  	} else {
  		throw new Error('source must support addEventListener/removeEventListener or addListener/removeListener');
  	}

  	return new Stream(s);
  }
  });

  var fromEvent$2 = interopDefault(fromEvent$1);
  var fromEvent$$1 = fromEvent$1.fromEvent;


  var require$$28 = Object.freeze({
  	default: fromEvent$2,
  	fromEvent: fromEvent$$1
  });

  var disposeThen = function (end, error, disposable, x) { return Promise.resolve(disposable.dispose()).then(function () { return end(x); }, error); }

  var runSource = function (source, scheduler, resolve, reject) {
    var disposable = dispose$1.settable()
    var observer = new Drain(resolve, reject, disposable)

    disposable.setDisposable(source.run(observer, scheduler))
  }

  var withScheduler = function (source, scheduler) { return new Promise(function (resolve, reject) { return runSource(source, scheduler, resolve, reject); }); }

  var withDefaultScheduler = function (source) { return withScheduler(source, defaultScheduler$1); }

  var Drain = function Drain (end, error, disposable) {
    this._end = end
    this._error = error
    this._disposable = disposable
    this.active = true
  };

  Drain.prototype.event = function event (t, x) {};

  Drain.prototype.end = function end (t, x) {
    if (!this.active) {
      return
    }
    this.active = false
    disposeThen(this._end, this._error, this._disposable, x)
  };

  Drain.prototype.error = function error (t, e) {
    this.active = false
    disposeThen(this._error, this._error, this._disposable, e)
  };


  var require$$2$6 = Object.freeze({
    withScheduler: withScheduler,
    withDefaultScheduler: withDefaultScheduler
  });

  var Pipe = createCommonjsModule(function (module) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  module.exports = Pipe;

  /**
   * A sink mixin that simply forwards event, end, and error to
   * another sink.
   * @param sink
   * @constructor
   */
  function Pipe(sink) {
  	this.sink = sink;
  }

  Pipe.prototype.event = function(t, x) {
  	return this.sink.event(t, x);
  };

  Pipe.prototype.end = function(t, x) {
  	return this.sink.end(t, x);
  };

  Pipe.prototype.error = function(t, e) {
  	return this.sink.error(t, e);
  };
  });

  var Pipe$1 = interopDefault(Pipe);


  var require$$4 = Object.freeze({
  	default: Pipe$1
  });

  var Filter = createCommonjsModule(function (module) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Pipe = interopDefault(require$$4);

  module.exports = Filter;

  function Filter(p, source) {
  	this.p = p;
  	this.source = source;
  }

  /**
   * Create a filtered source, fusing adjacent filter.filter if possible
   * @param {function(x:*):boolean} p filtering predicate
   * @param {{run:function}} source source to filter
   * @returns {Filter} filtered source
   */
  Filter.create = function createFilter(p, source) {
  	if (source instanceof Filter) {
  		return new Filter(and(source.p, p), source.source);
  	}

  	return new Filter(p, source);
  };

  Filter.prototype.run = function(sink, scheduler) {
  	return this.source.run(new FilterSink(this.p, sink), scheduler);
  };

  function FilterSink(p, sink) {
  	this.p = p;
  	this.sink = sink;
  }

  FilterSink.prototype.end   = Pipe.prototype.end;
  FilterSink.prototype.error = Pipe.prototype.error;

  FilterSink.prototype.event = function(t, x) {
  	var p = this.p;
  	p(x) && this.sink.event(t, x);
  };

  function and(p, q) {
  	return function(x) {
  		return p(x) && q(x);
  	};
  }
  });

  var Filter$1 = interopDefault(Filter);


  var require$$0$8 = Object.freeze({
  	default: Filter$1
  });

  var FilterMap = createCommonjsModule(function (module) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Pipe = interopDefault(require$$4);

  module.exports = FilterMap;

  function FilterMap(p, f, source) {
  	this.p = p;
  	this.f = f;
  	this.source = source;
  }

  FilterMap.prototype.run = function(sink, scheduler) {
  	return this.source.run(new FilterMapSink(this.p, this.f, sink), scheduler);
  };

  function FilterMapSink(p, f, sink) {
  	this.p = p;
  	this.f = f;
  	this.sink = sink;
  }

  FilterMapSink.prototype.event = function(t, x) {
  	var f = this.f;
  	var p = this.p;
  	p(x) && this.sink.event(t, f(x));
  };

  FilterMapSink.prototype.end = Pipe.prototype.end;
  FilterMapSink.prototype.error = Pipe.prototype.error;
  });

  var FilterMap$1 = interopDefault(FilterMap);


  var require$$1$7 = Object.freeze({
  	default: FilterMap$1
  });

  var _Map = createCommonjsModule(function (module) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Pipe = interopDefault(require$$4);
  var Filter = interopDefault(require$$0$8);
  var FilterMap = interopDefault(require$$1$7);
  var base = interopDefault(require$$0);

  module.exports = Map;

  function Map(f, source) {
  	this.f = f;
  	this.source = source;
  }

  /**
   * Create a mapped source, fusing adjacent map.map, filter.map,
   * and filter.map.map if possible
   * @param {function(*):*} f mapping function
   * @param {{run:function}} source source to map
   * @returns {Map|FilterMap} mapped source, possibly fused
   */
  Map.create = function createMap(f, source) {
  	if(source instanceof Map) {
  		return new Map(base.compose(f, source.f), source.source);
  	}

  	if(source instanceof Filter) {
  		return new FilterMap(source.p, f, source.source);
  	}

  	return new Map(f, source);
  };

  Map.prototype.run = function(sink, scheduler) {
  	return this.source.run(new MapSink(this.f, sink), scheduler);
  };

  function MapSink(f, sink) {
  	this.f = f;
  	this.sink = sink;
  }

  MapSink.prototype.end   = Pipe.prototype.end;
  MapSink.prototype.error = Pipe.prototype.error;

  MapSink.prototype.event = function(t, x) {
  	var f = this.f;
  	this.sink.event(t, f(x));
  };
  });

  var _Map$1 = interopDefault(_Map);


  var require$$0$7 = Object.freeze({
  	default: _Map$1
  });

  var transform = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);
  var Map = interopDefault(require$$0$7);
  var Pipe = interopDefault(require$$4);

  exports.map = map;
  exports.constant = constant;
  exports.tap = tap;

  /**
   * Transform each value in the stream by applying f to each
   * @param {function(*):*} f mapping function
   * @param {Stream} stream stream to map
   * @returns {Stream} stream containing items transformed by f
   */
  function map(f, stream) {
  	return new Stream(Map.create(f, stream.source));
  }

  /**
   * Replace each value in the stream with x
   * @param {*} x
   * @param {Stream} stream
   * @returns {Stream} stream containing items replaced with x
   */
  function constant(x, stream) {
  	return map(function() {
  		return x;
  	}, stream);
  }

  /**
   * Perform a side effect for each item in the stream
   * @param {function(x:*):*} f side effect to execute for each item. The
   *  return value will be discarded.
   * @param {Stream} stream stream to tap
   * @returns {Stream} new stream containing the same items as this stream
   */
  function tap(f, stream) {
  	return new Stream(new Tap(f, stream.source));
  }

  function Tap(f, source) {
  	this.source = source;
  	this.f = f;
  }

  Tap.prototype.run = function(sink, scheduler) {
  	return this.source.run(new TapSink(this.f, sink), scheduler);
  }

  function TapSink(f, sink) {
  	this.sink = sink;
  	this.f = f;
  }

  TapSink.prototype.end = Pipe.prototype.end;
  TapSink.prototype.error = Pipe.prototype.error;

  TapSink.prototype.event = function(t, x) {
  	var f = this.f;
  	f(x);
  	this.sink.event(t, x);
  }
  });

  var transform$1 = interopDefault(transform);
  var tap$1 = transform.tap;
  var constant$1 = transform.constant;
  var map$1 = transform.map;

var require$$7 = Object.freeze({
  	default: transform$1,
  	tap: tap$1,
  	constant: constant$1,
  	map: map$1
  });

  var observe$1 = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var run = interopDefault(require$$2$6).withDefaultScheduler;
  var tap = interopDefault(require$$7).tap;

  exports.observe = observe;
  exports.drain = drain;

  /**
   * Observe all the event values in the stream in time order. The
   * provided function `f` will be called for each event value
   * @param {function(x:T):*} f function to call with each event value
   * @param {Stream<T>} stream stream to observe
   * @return {Promise} promise that fulfills after the stream ends without
   *  an error, or rejects if the stream ends with an error.
   */
  function observe(f, stream) {
  	return drain(tap(f, stream));
  }

  var defaultScheduler = interopDefault(require$$1$4);
  var dispose = interopDefault(require$$3);

  /**
   * "Run" a stream by creating demand and consuming all events
   * @param {Stream<T>} stream stream to drain
   * @return {Promise} promise that fulfills after the stream ends without
   *  an error, or rejects if the stream ends with an error.
   */
  function drain(stream) {
  	return run(stream.source);
  }
  });

  var observe$2 = interopDefault(observe$1);
  var drain$1 = observe$1.drain;
  var observe$$1 = observe$1.observe;


  var require$$27 = Object.freeze({
  	default: observe$2,
  	drain: drain$1,
  	observe: observe$$1
  });

  var loop$1 = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);
  var Pipe = interopDefault(require$$4);

  exports.loop = loop;

  /**
   * Generalized feedback loop. Call a stepper function for each event. The stepper
   * will be called with 2 params: the current seed and the an event value.  It must
   * return a new { seed, value } pair. The `seed` will be fed back into the next
   * invocation of stepper, and the `value` will be propagated as the event value.
   * @param {function(seed:*, value:*):{seed:*, value:*}} stepper loop step function
   * @param {*} seed initial seed value passed to first stepper call
   * @param {Stream} stream event stream
   * @returns {Stream} new stream whose values are the `value` field of the objects
   * returned by the stepper
   */
  function loop(stepper, seed, stream) {
  	return new Stream(new Loop(stepper, seed, stream.source));
  }

  function Loop(stepper, seed, source) {
  	this.step = stepper;
  	this.seed = seed;
  	this.source = source;
  }

  Loop.prototype.run = function(sink, scheduler) {
  	return this.source.run(new LoopSink(this.step, this.seed, sink), scheduler);
  };

  function LoopSink(stepper, seed, sink) {
  	this.step = stepper;
  	this.seed = seed;
  	this.sink = sink;
  }

  LoopSink.prototype.error = Pipe.prototype.error;

  LoopSink.prototype.event = function(t, x) {
  	var result = this.step(this.seed, x);
  	this.seed = result.seed;
  	this.sink.event(t, result.value);
  };

  LoopSink.prototype.end = function(t) {
  	this.sink.end(t, this.seed);
  };
  });

  var loop$2 = interopDefault(loop$1);
  var loop$$1 = loop$1.loop;


  var require$$26 = Object.freeze({
  	default: loop$2,
  	loop: loop$$1
  });

  var accumulate = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);
  var Pipe = interopDefault(require$$4);
  var runSource = interopDefault(require$$2$6).withDefaultScheduler;
  var dispose = interopDefault(require$$3);
  var PropagateTask = interopDefault(require$$0$3);

  exports.scan = scan;
  exports.reduce = reduce;

  /**
   * Create a stream containing successive reduce results of applying f to
   * the previous reduce result and the current stream item.
   * @param {function(result:*, x:*):*} f reducer function
   * @param {*} initial initial value
   * @param {Stream} stream stream to scan
   * @returns {Stream} new stream containing successive reduce results
   */
  function scan(f, initial, stream) {
  	return new Stream(new Scan(f, initial, stream.source));
  }

  function Scan(f, z, source) {
  	this.source = source;
  	this.f = f;
  	this.value = z;
  }

  Scan.prototype.run = function(sink, scheduler) {
  	var d1 = scheduler.asap(PropagateTask.event(this.value, sink));
  	var d2 = this.source.run(new ScanSink(this.f, this.value, sink), scheduler);
  	return dispose.all([d1, d2]);
  };

  function ScanSink(f, z, sink) {
  	this.f = f;
  	this.value = z;
  	this.sink = sink;
  }

  ScanSink.prototype.event = function(t, x) {
  	var f = this.f;
  	this.value = f(this.value, x);
  	this.sink.event(t, this.value);
  };

  ScanSink.prototype.error = Pipe.prototype.error;
  ScanSink.prototype.end = Pipe.prototype.end;

  /**
   * Reduce a stream to produce a single result.  Note that reducing an infinite
   * stream will return a Promise that never fulfills, but that may reject if an error
   * occurs.
   * @param {function(result:*, x:*):*} f reducer function
   * @param {*} initial initial value
   * @param {Stream} stream to reduce
   * @returns {Promise} promise for the file result of the reduce
   */
  function reduce(f, initial, stream) {
  	return runSource(new Reduce(f, initial, stream.source));
  }

  function Reduce(f, z, source) {
  	this.source = source;
  	this.f = f;
  	this.value = z;
  }

  Reduce.prototype.run = function(sink, scheduler) {
  	return this.source.run(new ReduceSink(this.f, this.value, sink), scheduler);
  };

  function ReduceSink(f, z, sink) {
  	this.f = f;
  	this.value = z;
  	this.sink = sink;
  }

  ReduceSink.prototype.event = function(t, x) {
  	var f = this.f;
  	this.value = f(this.value, x);
  	this.sink.event(t, this.value);
  };

  ReduceSink.prototype.error = Pipe.prototype.error;

  ReduceSink.prototype.end = function(t) {
  	this.sink.end(t, this.value);
  };

  function noop() {}
  });

  var accumulate$1 = interopDefault(accumulate);
  var reduce$1 = accumulate.reduce;
  var scan$1 = accumulate.scan;

var require$$25 = Object.freeze({
  	default: accumulate$1,
  	reduce: reduce$1,
  	scan: scan$1
  });

  var unfold$1 = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);

  exports.unfold = unfold;

  /**
   * Compute a stream by unfolding tuples of future values from a seed value
   * Event times may be controlled by returning a Promise from f
   * @param {function(seed:*):{value:*, seed:*, done:boolean}|Promise<{value:*, seed:*, done:boolean}>} f unfolding function accepts
   *  a seed and returns a new tuple with a value, new seed, and boolean done flag.
   *  If tuple.done is true, the stream will end.
   * @param {*} seed seed value
   * @returns {Stream} stream containing all value of all tuples produced by the
   *  unfolding function.
   */
  function unfold(f, seed) {
  	return new Stream(new UnfoldSource(f, seed));
  }

  function UnfoldSource(f, seed) {
  	this.f = f;
  	this.value = seed;
  }

  UnfoldSource.prototype.run = function(sink, scheduler) {
  	return new Unfold(this.f, this.value, sink, scheduler);
  };

  function Unfold(f, x, sink, scheduler) {
  	this.f = f;
  	this.sink = sink;
  	this.scheduler = scheduler;
  	this.active = true;

  	var self = this;
  	function err(e) {
  		self.sink.error(self.scheduler.now(), e);
  	}

  	function start(unfold) {
  		return stepUnfold(unfold, x);
  	}

  	Promise.resolve(this).then(start).catch(err);
  }

  Unfold.prototype.dispose = function() {
  	this.active = false;
  };

  function stepUnfold(unfold, x) {
  	var f = unfold.f;
  	return Promise.resolve(f(x)).then(function(tuple) {
  		return continueUnfold(unfold, tuple);
  	});
  }

  function continueUnfold(unfold, tuple) {
  	if(tuple.done) {
  		unfold.sink.end(unfold.scheduler.now(), tuple.value);
  		return tuple.value;
  	}

  	unfold.sink.event(unfold.scheduler.now(), tuple.value);

  	if(!unfold.active) {
  		return tuple.value;
  	}
  	return stepUnfold(unfold, tuple.seed);
  }
  });

  var unfold$2 = interopDefault(unfold$1);
  var unfold$$1 = unfold$1.unfold;


  var require$$24 = Object.freeze({
  	default: unfold$2,
  	unfold: unfold$$1
  });

  var iterate$1 = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);

  exports.iterate = iterate;

  /**
   * Compute a stream by iteratively calling f to produce values
   * Event times may be controlled by returning a Promise from f
   * @param {function(x:*):*|Promise<*>} f
   * @param {*} x initial value
   * @returns {Stream}
   */
  function iterate(f, x) {
  	return new Stream(new IterateSource(f, x));
  }

  function IterateSource(f, x) {
  	this.f = f;
  	this.value = x;
  }

  IterateSource.prototype.run = function(sink, scheduler) {
  	return new Iterate(this.f, this.value, sink, scheduler);
  };

  function Iterate(f, initial, sink, scheduler) {
  	this.f = f;
  	this.sink = sink;
  	this.scheduler = scheduler;
  	this.active = true;

  	var x = initial;

  	var self = this;
  	function err(e) {
  		self.sink.error(self.scheduler.now(), e);
  	}

  	function start(iterate) {
  		return stepIterate(iterate, x);
  	}

  	Promise.resolve(this).then(start).catch(err);
  }

  Iterate.prototype.dispose = function() {
  	this.active = false;
  };

  function stepIterate(iterate, x) {
  	iterate.sink.event(iterate.scheduler.now(), x);

  	if(!iterate.active) {
  		return x;
  	}

  	var f = iterate.f;
  	return Promise.resolve(f(x)).then(function(y) {
  		return continueIterate(iterate, y);
  	});
  }

  function continueIterate(iterate, x) {
  	return !iterate.active ? iterate.value : stepIterate(iterate, x);
  }
  });

  var iterate$2 = interopDefault(iterate$1);
  var iterate$$1 = iterate$1.iterate;


  var require$$23 = Object.freeze({
  	default: iterate$2,
  	iterate: iterate$$1
  });

  var generate$1 = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2014 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);
  var base = interopDefault(require$$0);

  exports.generate = generate;

  /**
   * Compute a stream using an *async* generator, which yields promises
   * to control event times.
   * @param f
   * @returns {Stream}
   */
  function generate(f /*, ...args */) {
  	return new Stream(new GenerateSource(f, base.tail(arguments)));
  }

  function GenerateSource(f, args) {
  	this.f = f;
  	this.args = args;
  }

  GenerateSource.prototype.run = function(sink, scheduler) {
  	return new Generate(this.f.apply(void 0, this.args), sink, scheduler);
  };

  function Generate(iterator, sink, scheduler) {
  	this.iterator = iterator;
  	this.sink = sink;
  	this.scheduler = scheduler;
  	this.active = true;

  	var self = this;
  	function err(e) {
  		self.sink.error(self.scheduler.now(), e);
  	}

  	Promise.resolve(this).then(next).catch(err);
  }

  function next(generate, x) {
  	return generate.active ? handle(generate, generate.iterator.next(x)) : x;
  }

  function handle(generate, result) {
  	if (result.done) {
  		return generate.sink.end(generate.scheduler.now(), result.value);
  	}

  	return Promise.resolve(result.value).then(function (x) {
  		return emit(generate, x);
  	}, function(e) {
  		return error(generate, e);
  	});
  }

  function emit(generate, x) {
  	generate.sink.event(generate.scheduler.now(), x);
  	return next(generate, x);
  }

  function error(generate, e) {
  	return handle(generate, generate.iterator.throw(e));
  }

  Generate.prototype.dispose = function() {
  	this.active = false;
  };
  });

  var generate$2 = interopDefault(generate$1);
  var generate$$1 = generate$1.generate;


  var require$$22 = Object.freeze({
  	default: generate$2,
  	generate: generate$$1
  });

  var continueWith$1 = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);
  var Sink = interopDefault(require$$4);
  var dispose = interopDefault(require$$3);
  var isPromise = interopDefault(require$$1).isPromise;

  exports.continueWith = continueWith;

  function continueWith(f, stream) {
  	return new Stream(new ContinueWith(f, stream.source));
  }

  function ContinueWith(f, source) {
  	this.f = f;
  	this.source = source;
  }

  ContinueWith.prototype.run = function(sink, scheduler) {
  	return new ContinueWithSink(this.f, this.source, sink, scheduler);
  };

  function ContinueWithSink(f, source, sink, scheduler) {
  	this.f = f;
  	this.sink = sink;
  	this.scheduler = scheduler;
  	this.active = true;
  	this.disposable = dispose.once(source.run(this, scheduler));
  }

  ContinueWithSink.prototype.error = Sink.prototype.error;

  ContinueWithSink.prototype.event = function(t, x) {
  	if(!this.active) {
  		return;
  	}
  	this.sink.event(t, x);
  };

  ContinueWithSink.prototype.end = function(t, x) {
  	if(!this.active) {
  		return;
  	}

  	dispose.tryDispose(t, this.disposable, this.sink);
  	this._startNext(t, x, this.sink);
  };

  ContinueWithSink.prototype._startNext = function(t, x, sink) {
  	try {
  		this.disposable = this._continue(this.f, x, sink);
  	} catch(e) {
  		sink.error(t, e);
  	}
  };

  ContinueWithSink.prototype._continue = function(f, x, sink) {
  	return f(x).source.run(sink, this.scheduler);
  };

  ContinueWithSink.prototype.dispose = function() {
  	this.active = false;
  	return this.disposable.dispose();
  };
  });

  var continueWith$2 = interopDefault(continueWith$1);
  var continueWith$$1 = continueWith$1.continueWith;


  var require$$0$9 = Object.freeze({
  	default: continueWith$2,
  	continueWith: continueWith$$1
  });

  var build = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var streamOf = interopDefault(require$$0$2).of;
  var continueWith = interopDefault(require$$0$9).continueWith;

  exports.concat = concat;
  exports.cons = cons;

  /**
   * @param {*} x value to prepend
   * @param {Stream} stream
   * @returns {Stream} new stream with x prepended
   */
  function cons(x, stream) {
  	return concat(streamOf(x), stream);
  }

  /**
   * @param {Stream} left
   * @param {Stream} right
   * @returns {Stream} new stream containing all events in left followed by all
   *  events in right.  This *timeshifts* right to the end of left.
   */
  function concat(left, right) {
  	return continueWith(function() {
  		return right;
  	}, left);
  }
  });

  var build$1 = interopDefault(build);
  var cons = build.cons;
  var concat$1 = build.concat;

var require$$21 = Object.freeze({
  	default: build$1,
  	cons: cons,
  	concat: concat$1
  });

  var IndexSink = createCommonjsModule(function (module) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Sink = interopDefault(require$$4);

  module.exports = IndexSink;

  function IndexSink(i, sink) {
  	this.sink = sink;
  	this.index = i;
  	this.active = true;
  	this.value = void 0;
  }

  IndexSink.prototype.event = function(t, x) {
  	if(!this.active) {
  		return;
  	}
  	this.value = x;
  	this.sink.event(t, this);
  };

  IndexSink.prototype.end = function(t, x) {
  	if(!this.active) {
  		return;
  	}
  	this.active = false;
  	this.sink.end(t, { index: this.index, value: x });
  };

  IndexSink.prototype.error = Sink.prototype.error;
  });

  var IndexSink$1 = interopDefault(IndexSink);


  var require$$4$1 = Object.freeze({
  	default: IndexSink$1
  });

  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var invoke = function (f, args) {
    /*eslint complexity: [2,7]*/
    switch (args.length) {
      case 0:
        return f()
      case 1:
        return f(args[0])
      case 2:
        return f(args[0], args[1])
      case 3:
        return f(args[0], args[1], args[2])
      case 4:
        return f(args[0], args[1], args[2], args[3])
      case 5:
        return f(args[0], args[1], args[2], args[3], args[4])
      default:
        return f.apply(void 0, args)
    }
  }


  var require$$1$9 = Object.freeze({
    invoke: invoke
  });

  var combine$1 = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);
  var transform = interopDefault(require$$7);
  var core = interopDefault(require$$0$2);
  var Pipe = interopDefault(require$$4);
  var IndexSink = interopDefault(require$$4$1);
  var dispose = interopDefault(require$$3);
  var base = interopDefault(require$$0);
  var invoke = interopDefault(require$$1$9);

  var map = base.map;
  var tail = base.tail;

  exports.combineArray = combineArray;
  exports.combine = combine;

  /**
   * Combine latest events from all input streams
   * @param {function(...events):*} f function to combine most recent events
   * @returns {Stream} stream containing the result of applying f to the most recent
   *  event of each input stream, whenever a new event arrives on any stream.
   */
  function combine(f /*, ...streams */) {
  	return combineArray(f, tail(arguments));
  }

  /**
   * Combine latest events from all input streams
   * @param {function(...events):*} f function to combine most recent events
   * @param {[Stream]} streams most recent events
   * @returns {Stream} stream containing the result of applying f to the most recent
   *  event of each input stream, whenever a new event arrives on any stream.
   */
  function combineArray(f, streams) {
  	var l = streams.length;
  	return l === 0 ? core.empty()
  		 : l === 1 ? transform.map(f, streams[0])
  		 : new Stream(combineSources(f, streams));
  }

  function combineSources(f, streams) {
  	return new Combine(f, map(getSource, streams))
  }

  function getSource(stream) {
  	return stream.source;
  }

  function Combine(f, sources) {
  	this.f = f;
  	this.sources = sources;
  }

  Combine.prototype.run = function(sink, scheduler) {
  	var this$1 = this;

  	var l = this.sources.length;
  	var disposables = new Array(l);
  	var sinks = new Array(l);

  	var mergeSink = new CombineSink(disposables, sinks, sink, this.f);

  	for(var indexSink, i=0; i<l; ++i) {
  		indexSink = sinks[i] = new IndexSink(i, mergeSink);
  		disposables[i] = this$1.sources[i].run(indexSink, scheduler);
  	}

  	return dispose.all(disposables);
  };

  function CombineSink(disposables, sinks, sink, f) {
  	var this$1 = this;

  	this.sink = sink;
  	this.disposables = disposables;
  	this.sinks = sinks;
  	this.f = f;

  	var l = sinks.length;
  	this.awaiting = l;
  	this.values = new Array(l);
  	this.hasValue = new Array(l);
  	for(var i = 0; i < l; ++i) {
  		this$1.hasValue[i] = false;
  	}

  	this.activeCount = sinks.length;
  }

  CombineSink.prototype.error = Pipe.prototype.error;

  CombineSink.prototype.event = function(t, indexedValue) {
  	var i = indexedValue.index;
  	var awaiting = this._updateReady(i);

  	this.values[i] = indexedValue.value;
  	if(awaiting === 0) {
  		this.sink.event(t, invoke(this.f, this.values));
  	}
  };

  CombineSink.prototype._updateReady = function(index) {
  	if(this.awaiting > 0) {
  		if(!this.hasValue[index]) {
  			this.hasValue[index] = true
  			this.awaiting -= 1
  		}
  	}
  	return this.awaiting;
  }

  CombineSink.prototype.end = function(t, indexedValue) {
  	dispose.tryDispose(t, this.disposables[indexedValue.index], this.sink);
  	if(--this.activeCount === 0) {
  		this.sink.end(t, indexedValue.value);
  	}
  };
  });

  var combine$2 = interopDefault(combine$1);
  var combine$$1 = combine$1.combine;
  var combineArray$1 = combine$1.combineArray;

var require$$1$8 = Object.freeze({
  	default: combine$2,
  	combine: combine$$1,
  	combineArray: combineArray$1
  });

  var applicative = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var combine = interopDefault(require$$1$8).combine;
  var apply = interopDefault(require$$0).apply;

  exports.ap  = ap;

  /**
   * Assume fs is a stream containing functions, and apply the latest function
   * in fs to the latest value in xs.
   * fs:         --f---------g--------h------>
   * xs:         -a-------b-------c-------d-->
   * ap(fs, xs): --fa-----fb-gb---gc--hc--hd->
   * @param {Stream} fs stream of functions to apply to the latest x
   * @param {Stream} xs stream of values to which to apply all the latest f
   * @returns {Stream} stream containing all the applications of fs to xs
   */
  function ap(fs, xs) {
  	return combine(apply, fs, xs);
  }
  });

  var applicative$1 = interopDefault(applicative);
  var ap$1 = applicative.ap;

var require$$19 = Object.freeze({
  	default: applicative$1,
  	ap: ap$1
  });

  var transduce$1 = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);

  exports.transduce = transduce;

  /**
   * Transform a stream by passing its events through a transducer.
   * @param  {function} transducer transducer function
   * @param  {Stream} stream stream whose events will be passed through the
   *  transducer
   * @return {Stream} stream of events transformed by the transducer
   */
  function transduce(transducer, stream) {
  	return new Stream(new Transduce(transducer, stream.source));
  }

  function Transduce(transducer, source) {
  	this.transducer = transducer;
  	this.source = source;
  }

  Transduce.prototype.run = function(sink, scheduler) {
  	var xf = this.transducer(new Transformer(sink));
  	return this.source.run(new TransduceSink(getTxHandler(xf), sink), scheduler);
  };

  function TransduceSink(adapter, sink) {
  	this.xf = adapter;
  	this.sink = sink;
  }

  TransduceSink.prototype.event = function(t, x) {
  	var next = this.xf.step(t, x);

  	return this.xf.isReduced(next)
  		? this.sink.end(t, this.xf.getResult(next))
  		: next;
  };

  TransduceSink.prototype.end = function(t, x) {
  	return this.xf.result(x);
  };

  TransduceSink.prototype.error = function(t, e) {
  	return this.sink.error(t, e);
  };

  function Transformer(sink) {
  	this.time = -Infinity;
  	this.sink = sink;
  }

  Transformer.prototype['@@transducer/init'] = Transformer.prototype.init = function() {};

  Transformer.prototype['@@transducer/step'] = Transformer.prototype.step = function(t, x) {
  	if(!isNaN(t)) {
  		this.time = Math.max(t, this.time);
  	}
  	return this.sink.event(this.time, x);
  };

  Transformer.prototype['@@transducer/result'] = Transformer.prototype.result = function(x) {
  	return this.sink.end(this.time, x);
  };

  /**
   * Given an object supporting the new or legacy transducer protocol,
   * create an adapter for it.
   * @param {object} tx transform
   * @returns {TxAdapter|LegacyTxAdapter}
   */
  function getTxHandler(tx) {
  	return typeof tx['@@transducer/step'] === 'function'
  		? new TxAdapter(tx)
  		: new LegacyTxAdapter(tx);
  }

  /**
   * Adapter for new official transducer protocol
   * @param {object} tx transform
   * @constructor
   */
  function TxAdapter(tx) {
  	this.tx = tx;
  }

  TxAdapter.prototype.step = function(t, x) {
  	return this.tx['@@transducer/step'](t, x);
  };
  TxAdapter.prototype.result = function(x) {
  	return this.tx['@@transducer/result'](x);
  };
  TxAdapter.prototype.isReduced = function(x) {
  	return x != null && x['@@transducer/reduced'];
  };
  TxAdapter.prototype.getResult = function(x) {
  	return x['@@transducer/value'];
  };

  /**
   * Adapter for older transducer protocol
   * @param {object} tx transform
   * @constructor
   */
  function LegacyTxAdapter(tx) {
  	this.tx = tx;
  }

  LegacyTxAdapter.prototype.step = function(t, x) {
  	return this.tx.step(t, x);
  };
  LegacyTxAdapter.prototype.result = function(x) {
  	return this.tx.result(x);
  };
  LegacyTxAdapter.prototype.isReduced = function(x) {
  	return x != null && x.__transducers_reduced__;
  };
  LegacyTxAdapter.prototype.getResult = function(x) {
  	return x.value;
  };
  });

  var transduce$2 = interopDefault(transduce$1);
  var transduce$$1 = transduce$1.transduce;


  var require$$18 = Object.freeze({
  	default: transduce$2,
  	transduce: transduce$$1
  });

  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var LinkedList = function LinkedList () {
    this.head = null
    this.length = 0
  };

  LinkedList.prototype.add = function add (x) {
    if (this.head !== null) {
      this.head.prev = x
      x.next = this.head
    }
    this.head = x
    ++this.length
  };

  LinkedList.prototype.remove = function remove (x) {
    --this.length
    if (x === this.head) {
      this.head = this.head.next
    }
    if (x.next !== null) {
      x.next.prev = x.prev
      x.next = null
    }
    if (x.prev !== null) {
      x.prev.next = x.next
      x.prev = null
    }
  };

  LinkedList.prototype.isEmpty = function isEmpty () {
    return this.length === 0
  };

  LinkedList.prototype.dispose = function dispose () {
    if (this.isEmpty()) {
      return Promise.resolve()
    }

    var promises = []
    var x = this.head
    this.head = null
    this.length = 0

    while(x !== null) {
      promises.push(x.dispose())
      x = x.next
    }

    return Promise.all(promises)
  };



  var require$$1$10 = Object.freeze({
    default: LinkedList
  });

  var mergeConcurrently$1 = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);
  var dispose = interopDefault(require$$3);
  var LinkedList = interopDefault(require$$1$10);
  var identity = interopDefault(require$$0).id;

  exports.mergeConcurrently = mergeConcurrently;
  exports.mergeMapConcurrently = mergeMapConcurrently;

  function mergeConcurrently(concurrency, stream) {
  	return mergeMapConcurrently(identity, concurrency, stream);
  }

  function mergeMapConcurrently(f, concurrency, stream) {
  	return new Stream(new MergeConcurrently(f, concurrency, stream.source));
  }

  function MergeConcurrently(f, concurrency, source) {
  	this.f = f;
  	this.concurrency = concurrency;
  	this.source = source;
  }

  MergeConcurrently.prototype.run = function(sink, scheduler) {
  	return new Outer(this.f, this.concurrency, this.source, sink, scheduler);
  };

  function Outer(f, concurrency, source, sink, scheduler) {
  	this.f = f;
  	this.concurrency = concurrency;
  	this.sink = sink;
  	this.scheduler = scheduler;
  	this.pending = [];
  	this.current = new LinkedList();
  	this.disposable = dispose.once(source.run(this, scheduler));
  	this.active = true;
  }

  Outer.prototype.event = function(t, x) {
  	this._addInner(t, x);
  };

  Outer.prototype._addInner = function(t, x) {
  	if(this.current.length < this.concurrency) {
  		this._startInner(t, x);
  	} else {
  		this.pending.push(x);
  	}
  };

  Outer.prototype._startInner = function(t, x) {
  	try {
  		this._initInner(t, x);
  	} catch(e) {
  		this.error(t, e);
  	}
  };

  Outer.prototype._initInner = function(t, x) {
  	var innerSink = new Inner(t, this, this.sink);
  	innerSink.disposable = mapAndRun(this.f, x, innerSink, this.scheduler);
  	this.current.add(innerSink);
  }

  function mapAndRun(f, x, sink, scheduler) {
  	return f(x).source.run(sink, scheduler);
  }

  Outer.prototype.end = function(t, x) {
  	this.active = false;
  	dispose.tryDispose(t, this.disposable, this.sink);
  	this._checkEnd(t, x);
  };

  Outer.prototype.error = function(t, e) {
  	this.active = false;
  	this.sink.error(t, e);
  };

  Outer.prototype.dispose = function() {
  	this.active = false;
  	this.pending.length = 0;
  	return Promise.all([this.disposable.dispose(), this.current.dispose()]);
  };

  Outer.prototype._endInner = function(t, x, inner) {
  	this.current.remove(inner);
  	dispose.tryDispose(t, inner, this);

  	if(this.pending.length === 0) {
  		this._checkEnd(t, x);
  	} else {
  		this._startInner(t, this.pending.shift());
  	}
  };

  Outer.prototype._checkEnd = function(t, x) {
  	if(!this.active && this.current.isEmpty()) {
  		this.sink.end(t, x);
  	}
  };

  function Inner(time, outer, sink) {
  	this.prev = this.next = null;
  	this.time = time;
  	this.outer = outer;
  	this.sink = sink;
  	this.disposable = void 0;
  }

  Inner.prototype.event = function(t, x) {
  	this.sink.event(Math.max(t, this.time), x);
  };

  Inner.prototype.end = function(t, x) {
  	this.outer._endInner(Math.max(t, this.time), x, this);
  };

  Inner.prototype.error = function(t, e) {
  	this.outer.error(Math.max(t, this.time), e);
  };

  Inner.prototype.dispose = function() {
  	return this.disposable.dispose();
  };
  });

  var mergeConcurrently$2 = interopDefault(mergeConcurrently$1);
  var mergeMapConcurrently = mergeConcurrently$1.mergeMapConcurrently;
  var mergeConcurrently$$1 = mergeConcurrently$1.mergeConcurrently;


  var require$$0$11 = Object.freeze({
  	default: mergeConcurrently$2,
  	mergeMapConcurrently: mergeMapConcurrently,
  	mergeConcurrently: mergeConcurrently$$1
  });

  var flatMap$1 = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var mergeConcurrently = interopDefault(require$$0$11).mergeConcurrently;
  var mergeMapConcurrently = interopDefault(require$$0$11).mergeMapConcurrently;

  exports.flatMap = flatMap;
  exports.join = join;

  /**
   * Map each value in the stream to a new stream, and merge it into the
   * returned outer stream. Event arrival times are preserved.
   * @param {function(x:*):Stream} f chaining function, must return a Stream
   * @param {Stream} stream
   * @returns {Stream} new stream containing all events from each stream returned by f
   */
  function flatMap(f, stream) {
  	return mergeMapConcurrently(f, Infinity, stream);
  }

  /**
   * Monadic join. Flatten a Stream<Stream<X>> to Stream<X> by merging inner
   * streams to the outer. Event arrival times are preserved.
   * @param {Stream<Stream<X>>} stream stream of streams
   * @returns {Stream<X>} new stream containing all events of all inner streams
   */
  function join(stream) {
  	return mergeConcurrently(Infinity, stream);
  }
  });

  var flatMap$2 = interopDefault(flatMap$1);
  var join$1 = flatMap$1.join;
  var flatMap$$1 = flatMap$1.flatMap;


  var require$$0$10 = Object.freeze({
  	default: flatMap$2,
  	join: join$1,
  	flatMap: flatMap$$1
  });

  var concatMap$1 = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var mergeMapConcurrently = interopDefault(require$$0$11).mergeMapConcurrently;

  exports.concatMap = concatMap;

  /**
   * Map each value in stream to a new stream, and concatenate them all
   * stream:              -a---b---cX
   * f(a):                 1-1-1-1X
   * f(b):                        -2-2-2-2X
   * f(c):                                -3-3-3-3X
   * stream.concatMap(f): -1-1-1-1-2-2-2-2-3-3-3-3X
   * @param {function(x:*):Stream} f function to map each value to a stream
   * @param {Stream} stream
   * @returns {Stream} new stream containing all events from each stream returned by f
   */
  function concatMap(f, stream) {
  	return mergeMapConcurrently(f, 1, stream);
  }
  });

  var concatMap$2 = interopDefault(concatMap$1);
  var concatMap$$1 = concatMap$1.concatMap;


  var require$$15 = Object.freeze({
  	default: concatMap$2,
  	concatMap: concatMap$$1
  });

  var merge$1 = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);
  var Pipe = interopDefault(require$$4);
  var IndexSink = interopDefault(require$$4$1);
  var empty = interopDefault(require$$0$2).empty;
  var dispose = interopDefault(require$$3);
  var base = interopDefault(require$$0);

  var copy = base.copy;
  var reduce = base.reduce;

  exports.merge = merge;
  exports.mergeArray = mergeArray;

  /**
   * @returns {Stream} stream containing events from all streams in the argument
   * list in time order.  If two events are simultaneous they will be merged in
   * arbitrary order.
   */
  function merge(/*...streams*/) {
  	return mergeArray(copy(arguments));
  }

  /**
   * @param {Array} streams array of stream to merge
   * @returns {Stream} stream containing events from all input observables
   * in time order.  If two events are simultaneous they will be merged in
   * arbitrary order.
   */
  function mergeArray(streams) {
      var l = streams.length;
      return l === 0 ? empty()
  		 : l === 1 ? streams[0]
  		 : new Stream(mergeSources(streams));
  }

  /**
   * This implements fusion/flattening for merge.  It will
   * fuse adjacent merge operations.  For example:
   * - a.merge(b).merge(c) effectively becomes merge(a, b, c)
   * - merge(a, merge(b, c)) effectively becomes merge(a, b, c)
   * It does this by concatenating the sources arrays of
   * any nested Merge sources, in effect "flattening" nested
   * merge operations into a single merge.
   */
  function mergeSources(streams) {
  	return new Merge(reduce(appendSources, [], streams))
  }

  function appendSources(sources, stream) {
  	var source = stream.source;
  	return source instanceof Merge
  		? sources.concat(source.sources)
  		: sources.concat(source)
  }

  function Merge(sources) {
  	this.sources = sources;
  }

  Merge.prototype.run = function(sink, scheduler) {
  	var this$1 = this;

  	var l = this.sources.length;
  	var disposables = new Array(l);
  	var sinks = new Array(l);

  	var mergeSink = new MergeSink(disposables, sinks, sink);

  	for(var indexSink, i=0; i<l; ++i) {
  		indexSink = sinks[i] = new IndexSink(i, mergeSink);
  		disposables[i] = this$1.sources[i].run(indexSink, scheduler);
  	}

  	return dispose.all(disposables);
  };

  function MergeSink(disposables, sinks, sink) {
  	this.sink = sink;
  	this.disposables = disposables;
  	this.activeCount = sinks.length;
  }

  MergeSink.prototype.error = Pipe.prototype.error;

  MergeSink.prototype.event = function(t, indexValue) {
  	this.sink.event(t, indexValue.value);
  };

  MergeSink.prototype.end = function(t, indexedValue) {
  	dispose.tryDispose(t, this.disposables[indexedValue.index], this.sink);
  	if(--this.activeCount === 0) {
  		this.sink.end(t, indexedValue.value);
  	}
  };
  });

  var merge$2 = interopDefault(merge$1);
  var mergeArray$1 = merge$1.mergeArray;
  var merge$$1 = merge$1.merge;


  var require$$13 = Object.freeze({
  	default: merge$2,
  	mergeArray: mergeArray$1,
  	merge: merge$$1
  });

  var sample$1 = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);
  var Pipe = interopDefault(require$$4);
  var dispose = interopDefault(require$$3);
  var base = interopDefault(require$$0);
  var invoke = interopDefault(require$$1$9);

  exports.sample = sample;
  exports.sampleWith = sampleWith;
  exports.sampleArray = sampleArray;

  /**
   * When an event arrives on sampler, emit the result of calling f with the latest
   * values of all streams being sampled
   * @param {function(...values):*} f function to apply to each set of sampled values
   * @param {Stream} sampler streams will be sampled whenever an event arrives
   *  on sampler
   * @returns {Stream} stream of sampled and transformed values
   */
  function sample(f, sampler /*, ...streams */) {
  	return sampleArray(f, sampler, base.drop(2, arguments));
  }

  /**
   * When an event arrives on sampler, emit the latest event value from stream.
   * @param {Stream} sampler stream of events at whose arrival time
   *  stream's latest value will be propagated
   * @param {Stream} stream stream of values
   * @returns {Stream} sampled stream of values
   */
  function sampleWith(sampler, stream) {
  	return new Stream(new Sampler(base.id, sampler.source, [stream.source]));
  }

  function sampleArray(f, sampler, streams) {
  	return new Stream(new Sampler(f, sampler.source, base.map(getSource, streams)));
  }

  function getSource(stream) {
  	return stream.source;
  }

  function Sampler(f, sampler, sources) {
  	this.f = f;
  	this.sampler = sampler;
  	this.sources = sources;
  }

  Sampler.prototype.run = function(sink, scheduler) {
  	var this$1 = this;

  	var l = this.sources.length;
  	var disposables = new Array(l+1);
  	var sinks = new Array(l);

  	var sampleSink = new SampleSink(this.f, sinks, sink);

  	for(var hold, i=0; i<l; ++i) {
  		hold = sinks[i] = new Hold(sampleSink);
  		disposables[i] = this$1.sources[i].run(hold, scheduler);
  	}

  	disposables[i] = this.sampler.run(sampleSink, scheduler);

  	return dispose.all(disposables);
  };

  function Hold(sink) {
  	this.sink = sink;
  	this.hasValue = false;
  }

  Hold.prototype.event = function(t, x) {
  	this.value = x;
  	this.hasValue = true;
  	this.sink._notify(this);
  };

  Hold.prototype.end = function () {};
  Hold.prototype.error = Pipe.prototype.error;

  function SampleSink(f, sinks, sink) {
  	this.f = f;
  	this.sinks = sinks;
  	this.sink = sink;
  	this.active = false;
  }

  SampleSink.prototype._notify = function() {
  	if(!this.active) {
  		this.active = this.sinks.every(hasValue);
  	}
  };

  SampleSink.prototype.event = function(t) {
  	if(this.active) {
  		this.sink.event(t, invoke(this.f, base.map(getValue, this.sinks)));
  	}
  };

  SampleSink.prototype.end = Pipe.prototype.end;
  SampleSink.prototype.error = Pipe.prototype.error;

  function hasValue(hold) {
  	return hold.hasValue;
  }

  function getValue(hold) {
  	return hold.value;
  }
  });

  var sample$2 = interopDefault(sample$1);
  var sampleArray = sample$1.sampleArray;
  var sampleWith$1 = sample$1.sampleWith;
  var sample$$1 = sample$1.sample;


  var require$$11 = Object.freeze({
  	default: sample$2,
  	sampleArray: sampleArray,
  	sampleWith: sampleWith$1,
  	sample: sample$$1
  });

  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  // Based on https://github.com/petkaantonov/deque

  var Queue = function Queue (capPow2) {
    this._capacity = capPow2 || 32
    this._length = 0
    this._head = 0
  };

  Queue.prototype.push = function push (x) {
    var len = this._length
    this._checkCapacity(len + 1)

    var i = (this._head + len) & (this._capacity - 1)
    this[i] = x
    this._length = len + 1
  };

  Queue.prototype.shift = function shift () {
    var head = this._head
    var x = this[head]

    this[head] = void 0
    this._head = (head + 1) & (this._capacity - 1)
    this._length--
    return x
  };

  Queue.prototype.isEmpty = function isEmpty () {
    return this._length === 0
  };

  Queue.prototype.length = function length () {
    return this._length
  };

  Queue.prototype._checkCapacity = function _checkCapacity (size) {
    if (this._capacity < size) {
      this._ensureCapacity(this._capacity << 1)
    }
  };

  Queue.prototype._ensureCapacity = function _ensureCapacity (capacity) {
    var oldCapacity = this._capacity
    this._capacity = capacity

    var last = this._head + this._length

    if (last > oldCapacity) {
      copy(this, 0, this, oldCapacity, last & (oldCapacity - 1))
    }
  };

  function copy (src, srcIndex, dst, dstIndex, len) {
    for (var j = 0; j < len; ++j) {
      dst[j + dstIndex] = src[j + srcIndex]
      src[j + srcIndex] = void 0
    }
  }


  var require$$0$12 = Object.freeze({
    default: Queue
  });

  var zip$1 = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);
  var transform = interopDefault(require$$7);
  var core = interopDefault(require$$0$2);
  var Sink = interopDefault(require$$4);
  var IndexSink = interopDefault(require$$4$1);
  var dispose = interopDefault(require$$3);
  var base = interopDefault(require$$0);
  var invoke = interopDefault(require$$1$9);
  var Queue = interopDefault(require$$0$12);

  var map = base.map;
  var tail = base.tail;

  exports.zip = zip;
  exports.zipArray = zipArray;

  /**
   * Combine streams pairwise (or tuple-wise) by index by applying f to values
   * at corresponding indices.  The returned stream ends when any of the input
   * streams ends.
   * @param {function} f function to combine values
   * @returns {Stream} new stream with items at corresponding indices combined
   *  using f
   */
  function zip(f /*,...streams */) {
  	return zipArray(f, tail(arguments));
  }

  /**
   * Combine streams pairwise (or tuple-wise) by index by applying f to values
   * at corresponding indices.  The returned stream ends when any of the input
   * streams ends.
   * @param {function} f function to combine values
   * @param {[Stream]} streams streams to zip using f
   * @returns {Stream} new stream with items at corresponding indices combined
   *  using f
   */
  function zipArray(f, streams) {
  	return streams.length === 0 ? core.empty()
  		 : streams.length === 1 ? transform.map(f, streams[0])
  		 : new Stream(new Zip(f, map(getSource, streams)));
  }

  function getSource(stream) {
  	return stream.source;
  }

  function Zip(f, sources) {
  	this.f = f;
  	this.sources = sources;
  }

  Zip.prototype.run = function(sink, scheduler) {
  	var this$1 = this;

  	var l = this.sources.length;
  	var disposables = new Array(l);
  	var sinks = new Array(l);
  	var buffers = new Array(l);

  	var zipSink = new ZipSink(this.f, buffers, sinks, sink);

  	for(var indexSink, i=0; i<l; ++i) {
  		buffers[i] = new Queue();
  		indexSink = sinks[i] = new IndexSink(i, zipSink);
  		disposables[i] = this$1.sources[i].run(indexSink, scheduler);
  	}

  	return dispose.all(disposables);
  };

  function ZipSink(f, buffers, sinks, sink) {
  	this.f = f;
  	this.sinks = sinks;
  	this.sink = sink;
  	this.buffers = buffers;
  }

  ZipSink.prototype.event = function(t, indexedValue) {
  	var buffers = this.buffers;
  	var buffer = buffers[indexedValue.index];

  	buffer.push(indexedValue.value);

  	if(buffer.length() === 1) {
  		if(!ready(this.buffers)) {
  			return;
  		}

  		emitZipped(this.f, t, buffers, this.sink);

  		if (ended(this.buffers, this.sinks)) {
  			this.sink.end(t, void 0);
  		}
  	}
  };

  ZipSink.prototype.end = function(t, indexedValue) {
  	var buffer = this.buffers[indexedValue.index];
  	if(buffer.isEmpty()) {
  		this.sink.end(t, indexedValue.value);
  	}
  };

  ZipSink.prototype.error = Sink.prototype.error;

  function emitZipped (f, t, buffers, sink) {
  	sink.event(t, invoke(f, map(head, buffers)));
  }

  function head(buffer) {
  	return buffer.shift();
  }

  function ended(buffers, sinks) {
  	for(var i=0, l=buffers.length; i<l; ++i) {
  		if(buffers[i].isEmpty() && !sinks[i].active) {
  			return true;
  		}
  	}
  	return false;
  }

  function ready(buffers) {
  	for(var i=0, l=buffers.length; i<l; ++i) {
  		if(buffers[i].isEmpty()) {
  			return false;
  		}
  	}
  	return true;
  }
  });

  var zip$2 = interopDefault(zip$1);
  var zipArray = zip$1.zipArray;
  var zip$$1 = zip$1.zip;


  var require$$10 = Object.freeze({
  	default: zip$2,
  	zipArray: zipArray,
  	zip: zip$$1
  });

  var _switch = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);
  var dispose = interopDefault(require$$3);

  exports.switch = switchLatest;

  /**
   * Given a stream of streams, return a new stream that adopts the behavior
   * of the most recent inner stream.
   * @param {Stream} stream of streams on which to switch
   * @returns {Stream} switching stream
   */
  function switchLatest(stream) {
  	return new Stream(new Switch(stream.source));
  }

  function Switch(source) {
  	this.source = source;
  }

  Switch.prototype.run = function(sink, scheduler) {
  	var switchSink = new SwitchSink(sink, scheduler);
  	return dispose.all(switchSink, this.source.run(switchSink, scheduler));
  };

  function SwitchSink(sink, scheduler) {
  	this.sink = sink;
  	this.scheduler = scheduler;
  	this.current = null;
  	this.ended = false;
  }

  SwitchSink.prototype.event = function(t, stream) {
  	this._disposeCurrent(t); // TODO: capture the result of this dispose
  	this.current = new Segment(t, Infinity, this, this.sink);
  	this.current.disposable = stream.source.run(this.current, this.scheduler);
  };

  SwitchSink.prototype.end = function(t, x) {
  	this.ended = true;
  	this._checkEnd(t, x);
  };

  SwitchSink.prototype.error = function(t, e) {
  	this.ended = true;
  	this.sink.error(t, e);
  };

  SwitchSink.prototype.dispose = function() {
  	return this._disposeCurrent(0);
  };

  SwitchSink.prototype._disposeCurrent = function(t) {
  	if(this.current !== null) {
  		return this.current._dispose(t);
  	}
  };

  SwitchSink.prototype._disposeInner = function(t, inner) {
  	inner._dispose(t); // TODO: capture the result of this dispose
  	if(inner === this.current) {
  		this.current = null;
  	}
  };

  SwitchSink.prototype._checkEnd = function(t, x) {
  	if(this.ended && this.current === null) {
  		this.sink.end(t, x);
  	}
  };

  SwitchSink.prototype._endInner = function(t, x, inner) {
  	this._disposeInner(t, inner);
  	this._checkEnd(t, x);
  };

  SwitchSink.prototype._errorInner = function(t, e, inner) {
  	this._disposeInner(t, inner);
  	this.sink.error(t, e);
  };

  function Segment(min, max, outer, sink) {
  	this.min = min;
  	this.max = max;
  	this.outer = outer;
  	this.sink = sink;
  	this.disposable = dispose.empty();
  }

  Segment.prototype.event = function(t, x) {
  	if(t < this.max) {
  		this.sink.event(Math.max(t, this.min), x);
  	}
  };

  Segment.prototype.end = function(t, x) {
  	this.outer._endInner(Math.max(t, this.min), x, this);
  };

  Segment.prototype.error = function(t, e) {
  	this.outer._errorInner(Math.max(t, this.min), e, this);
  };

  Segment.prototype._dispose = function(t) {
  	this.max = t;
  	dispose.tryDispose(t, this.disposable, this.sink)
  };
  });

  var _switch$1 = interopDefault(_switch);


  var require$$9 = Object.freeze({
  	default: _switch$1
  });

  var filter$1 = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);
  var Sink = interopDefault(require$$4);
  var Filter = interopDefault(require$$0$8);

  exports.filter = filter;
  exports.skipRepeats = skipRepeats;
  exports.skipRepeatsWith = skipRepeatsWith;

  /**
   * Retain only items matching a predicate
   * @param {function(x:*):boolean} p filtering predicate called for each item
   * @param {Stream} stream stream to filter
   * @returns {Stream} stream containing only items for which predicate returns truthy
   */
  function filter(p, stream) {
  	return new Stream(Filter.create(p, stream.source));
  }

  /**
   * Skip repeated events, using === to detect duplicates
   * @param {Stream} stream stream from which to omit repeated events
   * @returns {Stream} stream without repeated events
   */
  function skipRepeats(stream) {
  	return skipRepeatsWith(same, stream);
  }

  /**
   * Skip repeated events using the provided equals function to detect duplicates
   * @param {function(a:*, b:*):boolean} equals optional function to compare items
   * @param {Stream} stream stream from which to omit repeated events
   * @returns {Stream} stream without repeated events
   */
  function skipRepeatsWith(equals, stream) {
  	return new Stream(new SkipRepeats(equals, stream.source));
  }

  function SkipRepeats(equals, source) {
  	this.equals = equals;
  	this.source = source;
  }

  SkipRepeats.prototype.run = function(sink, scheduler) {
  	return this.source.run(new SkipRepeatsSink(this.equals, sink), scheduler);
  };

  function SkipRepeatsSink(equals, sink) {
  	this.equals = equals;
  	this.sink = sink;
  	this.value = void 0;
  	this.init = true;
  }

  SkipRepeatsSink.prototype.end   = Sink.prototype.end;
  SkipRepeatsSink.prototype.error = Sink.prototype.error;

  SkipRepeatsSink.prototype.event = function(t, x) {
  	if(this.init) {
  		this.init = false;
  		this.value = x;
  		this.sink.event(t, x);
  	} else if(!this.equals(this.value, x)) {
  		this.value = x;
  		this.sink.event(t, x);
  	}
  };

  function same(a, b) {
  	return a === b;
  }
  });

  var filter$2 = interopDefault(filter$1);
  var skipRepeatsWith$1 = filter$1.skipRepeatsWith;
  var skipRepeats$1 = filter$1.skipRepeats;
  var filter$$1 = filter$1.filter;


  var require$$8 = Object.freeze({
  	default: filter$2,
  	skipRepeatsWith: skipRepeatsWith$1,
  	skipRepeats: skipRepeats$1,
  	filter: filter$$1
  });

  var slice$1 = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);
  var Sink = interopDefault(require$$4);
  var core = interopDefault(require$$0$2);
  var dispose = interopDefault(require$$3);
  var Map = interopDefault(require$$0$7);

  exports.take = take;
  exports.skip = skip;
  exports.slice = slice;
  exports.takeWhile = takeWhile;
  exports.skipWhile = skipWhile;

  /**
   * @param {number} n
   * @param {Stream} stream
   * @returns {Stream} new stream containing only up to the first n items from stream
   */
  function take(n, stream) {
  	return slice(0, n, stream);
  }

  /**
   * @param {number} n
   * @param {Stream} stream
   * @returns {Stream} new stream with the first n items removed
   */
  function skip(n, stream) {
  	return slice(n, Infinity, stream);
  }

  /**
   * Slice a stream by index. Negative start/end indexes are not supported
   * @param {number} start
   * @param {number} end
   * @param {Stream} stream
   * @returns {Stream} stream containing items where start <= index < end
   */
  function slice(start, end, stream) {
  	return end <= start ? core.empty()
  		: new Stream(sliceSource(start, end, stream.source));
  }

  function sliceSource(start, end, source) {
  	return source instanceof Map ? commuteMapSlice(start, end, source)
  		: source instanceof Slice ? fuseSlice(start, end, source)
  		: new Slice(start, end, source);
  }

  function commuteMapSlice(start, end, source) {
  	return Map.create(source.f, sliceSource(start, end, source.source))
  }

  function fuseSlice(start, end, source) {
  	start += source.min;
  	end = Math.min(end + source.min, source.max);
  	return new Slice(start, end, source.source);
  }

  function Slice(min, max, source) {
  	this.source = source;
  	this.min = min;
  	this.max = max;
  }

  Slice.prototype.run = function(sink, scheduler) {
  	return new SliceSink(this.min, this.max - this.min, this.source, sink, scheduler);
  };

  function SliceSink(skip, take, source, sink, scheduler) {
  	this.sink = sink;
  	this.skip = skip;
  	this.take = take;
  	this.disposable = dispose.once(source.run(this, scheduler));
  }

  SliceSink.prototype.end   = Sink.prototype.end;
  SliceSink.prototype.error = Sink.prototype.error;

  SliceSink.prototype.event = function(t, x) {
  	if(this.skip > 0) {
  		this.skip -= 1;
  		return;
  	}

  	if(this.take === 0) {
  		return;
  	}

  	this.take -= 1;
  	this.sink.event(t, x);
  	if(this.take === 0) {
  		this.dispose();
  		this.sink.end(t, x);
  	}
  };

  SliceSink.prototype.dispose = function() {
  	return this.disposable.dispose();
  };

  function takeWhile(p, stream) {
  	return new Stream(new TakeWhile(p, stream.source));
  }

  function TakeWhile(p, source) {
  	this.p = p;
  	this.source = source;
  }

  TakeWhile.prototype.run = function(sink, scheduler) {
  	return new TakeWhileSink(this.p, this.source, sink, scheduler);
  };

  function TakeWhileSink(p, source, sink, scheduler) {
  	this.p = p;
  	this.sink = sink;
  	this.active = true;
  	this.disposable = dispose.once(source.run(this, scheduler));
  }

  TakeWhileSink.prototype.end   = Sink.prototype.end;
  TakeWhileSink.prototype.error = Sink.prototype.error;

  TakeWhileSink.prototype.event = function(t, x) {
  	if(!this.active) {
  		return;
  	}

  	var p = this.p;
  	this.active = p(x);
  	if(this.active) {
  		this.sink.event(t, x);
  	} else {
  		this.dispose();
  		this.sink.end(t, x);
  	}
  };

  TakeWhileSink.prototype.dispose = function() {
  	return this.disposable.dispose();
  };

  function skipWhile(p, stream) {
  	return new Stream(new SkipWhile(p, stream.source));
  }

  function SkipWhile(p, source) {
  	this.p = p;
  	this.source = source;
  }

  SkipWhile.prototype.run = function(sink, scheduler) {
  	return this.source.run(new SkipWhileSink(this.p, sink), scheduler);
  };

  function SkipWhileSink(p, sink) {
  	this.p = p;
  	this.sink = sink;
  	this.skipping = true;
  }

  SkipWhileSink.prototype.end   = Sink.prototype.end;
  SkipWhileSink.prototype.error = Sink.prototype.error;

  SkipWhileSink.prototype.event = function(t, x) {
  	if(this.skipping) {
  		var p = this.p;
  		this.skipping = p(x);
  		if(this.skipping) {
  			return;
  		}
  	}

  	this.sink.event(t, x);
  };
  });

  var slice$2 = interopDefault(slice$1);
  var skipWhile$1 = slice$1.skipWhile;
  var takeWhile$1 = slice$1.takeWhile;
  var slice$$1 = slice$1.slice;
  var skip$1 = slice$1.skip;
  var take$1 = slice$1.take;

var require$$7$1 = Object.freeze({
  	default: slice$2,
  	skipWhile: skipWhile$1,
  	takeWhile: takeWhile$1,
  	slice: slice$$1,
  	skip: skip$1,
  	take: take$1
  });

  var timeslice = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);
  var Pipe = interopDefault(require$$4);
  var dispose = interopDefault(require$$3);
  var join = interopDefault(require$$0$10).join;

  exports.during    = during;
  exports.takeUntil = takeUntil;
  exports.skipUntil = skipUntil;

  function takeUntil(signal, stream) {
  	return new Stream(new Until(signal.source, stream.source));
  }

  function skipUntil(signal, stream) {
  	return new Stream(new Since(signal.source, stream.source));
  }

  function during(timeWindow, stream) {
  	return takeUntil(join(timeWindow), skipUntil(timeWindow, stream));
  }

  function Until(maxSignal, source) {
  	this.maxSignal = maxSignal;
  	this.source = source;
  }

  Until.prototype.run = function(sink, scheduler) {
  	var min = new Bound(-Infinity, sink);
  	var max = new UpperBound(this.maxSignal, sink, scheduler);
  	var disposable = this.source.run(new TimeWindowSink(min, max, sink), scheduler);

  	return dispose.all([min, max, disposable]);
  };

  function Since(minSignal, source) {
  	this.minSignal = minSignal;
  	this.source = source;
  }

  Since.prototype.run = function(sink, scheduler) {
  	var min = new LowerBound(this.minSignal, sink, scheduler);
  	var max = new Bound(Infinity, sink);
  	var disposable = this.source.run(new TimeWindowSink(min, max, sink), scheduler);

  	return dispose.all([min, max, disposable]);
  };

  function Bound(value, sink) {
  	this.value = value;
  	this.sink = sink;
  }

  Bound.prototype.error = Pipe.prototype.error;
  Bound.prototype.event = noop;
  Bound.prototype.end = noop;
  Bound.prototype.dispose = noop;

  function TimeWindowSink(min, max, sink) {
  	this.min = min;
  	this.max = max;
  	this.sink = sink;
  }

  TimeWindowSink.prototype.event = function(t, x) {
  	if(t >= this.min.value && t < this.max.value) {
  		this.sink.event(t, x);
  	}
  };

  TimeWindowSink.prototype.error = Pipe.prototype.error;
  TimeWindowSink.prototype.end = Pipe.prototype.end;

  function LowerBound(signal, sink, scheduler) {
  	this.value = Infinity;
  	this.sink = sink;
  	this.disposable = signal.run(this, scheduler);
  }

  LowerBound.prototype.event = function(t /*, x */) {
  	if(t < this.value) {
  		this.value = t;
  	}
  };

  LowerBound.prototype.end = noop;
  LowerBound.prototype.error = Pipe.prototype.error;

  LowerBound.prototype.dispose = function() {
  	return this.disposable.dispose();
  };

  function UpperBound(signal, sink, scheduler) {
  	this.value = Infinity;
  	this.sink = sink;
  	this.disposable = signal.run(this, scheduler);
  }

  UpperBound.prototype.event = function(t, x) {
  	if(t < this.value) {
  		this.value = t;
  		this.sink.end(t, x);
  	}
  };

  UpperBound.prototype.end = noop;
  UpperBound.prototype.error = Pipe.prototype.error;

  UpperBound.prototype.dispose = function() {
  	return this.disposable.dispose();
  };

  function noop() {}
  });

  var timeslice$1 = interopDefault(timeslice);
  var skipUntil$1 = timeslice.skipUntil;
  var takeUntil$1 = timeslice.takeUntil;
  var during$1 = timeslice.during;

var require$$6$1 = Object.freeze({
  	default: timeslice$1,
  	skipUntil: skipUntil$1,
  	takeUntil: takeUntil$1,
  	during: during$1
  });

  var delay$1 = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);
  var Sink = interopDefault(require$$4);
  var dispose = interopDefault(require$$3);
  var PropagateTask = interopDefault(require$$0$3);

  exports.delay = delay;

  /**
   * @param {Number} delayTime milliseconds to delay each item
   * @param {Stream} stream
   * @returns {Stream} new stream containing the same items, but delayed by ms
   */
  function delay(delayTime, stream) {
  	return delayTime <= 0 ? stream
  		 : new Stream(new Delay(delayTime, stream.source));
  }

  function Delay(dt, source) {
  	this.dt = dt;
  	this.source = source;
  }

  Delay.prototype.run = function(sink, scheduler) {
  	var delaySink = new DelaySink(this.dt, sink, scheduler);
  	return dispose.all([delaySink, this.source.run(delaySink, scheduler)]);
  };

  function DelaySink(dt, sink, scheduler) {
  	this.dt = dt;
  	this.sink = sink;
  	this.scheduler = scheduler;
  }

  DelaySink.prototype.dispose = function() {
  	var self = this;
  	this.scheduler.cancelAll(function(task) {
  		return task.sink === self.sink;
  	});
  };

  DelaySink.prototype.event = function(t, x) {
  	this.scheduler.delay(this.dt, PropagateTask.event(x, this.sink));
  };

  DelaySink.prototype.end = function(t, x) {
  	this.scheduler.delay(this.dt, PropagateTask.end(x, this.sink));
  };

  DelaySink.prototype.error = Sink.prototype.error;
  });

  var delay$2 = interopDefault(delay$1);
  var delay$$1 = delay$1.delay;


  var require$$5$1 = Object.freeze({
  	default: delay$2,
  	delay: delay$$1
  });

  var timestamp$1 = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);
  var Sink = interopDefault(require$$4);

  exports.timestamp = timestamp;

  function timestamp(stream) {
  	return new Stream(new Timestamp(stream.source));
  }

  function Timestamp(source) {
  	this.source = source;
  }

  Timestamp.prototype.run = function(sink, scheduler) {
  	return this.source.run(new TimestampSink(sink), scheduler);
  };

  function TimestampSink(sink) {
  	this.sink = sink;
  }

  TimestampSink.prototype.end   = Sink.prototype.end;
  TimestampSink.prototype.error = Sink.prototype.error;

  TimestampSink.prototype.event = function(t, x) {
  	this.sink.event(t, { time: t, value: x });
  };
  });

  var timestamp$2 = interopDefault(timestamp$1);
  var timestamp$$1 = timestamp$1.timestamp;


  var require$$4$2 = Object.freeze({
  	default: timestamp$2,
  	timestamp: timestamp$$1
  });

  var limit = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);
  var Sink = interopDefault(require$$4);
  var dispose = interopDefault(require$$3);
  var PropagateTask = interopDefault(require$$0$3);
  var Map = interopDefault(require$$0$7);

  exports.throttle = throttle;
  exports.debounce = debounce;

  /**
   * Limit the rate of events by suppressing events that occur too often
   * @param {Number} period time to suppress events
   * @param {Stream} stream
   * @returns {Stream}
   */
  function throttle(period, stream) {
  	return new Stream(throttleSource(period, stream.source));
  }

  function throttleSource(period, source) {
  	return source instanceof Map ? commuteMapThrottle(period, source)
  		: source instanceof Throttle ? fuseThrottle(period, source)
  		: new Throttle(period, source)
  }

  function commuteMapThrottle(period, source) {
  	return Map.create(source.f, throttleSource(period, source.source))
  }

  function fuseThrottle(period, source) {
  	return new Throttle(Math.max(period, source.period), source.source)
  }

  function Throttle(period, source) {
  	this.period = period;
  	this.source = source;
  }

  Throttle.prototype.run = function(sink, scheduler) {
  	return this.source.run(new ThrottleSink(this.period, sink), scheduler);
  };

  function ThrottleSink(period, sink) {
  	this.time = 0;
  	this.period = period;
  	this.sink = sink;
  }

  ThrottleSink.prototype.event = function(t, x) {
  	if(t >= this.time) {
  		this.time = t + this.period;
  		this.sink.event(t, x);
  	}
  };

  ThrottleSink.prototype.end   = Sink.prototype.end;

  ThrottleSink.prototype.error = Sink.prototype.error;

  /**
   * Wait for a burst of events to subside and emit only the last event in the burst
   * @param {Number} period events occuring more frequently than this
   *  will be suppressed
   * @param {Stream} stream stream to debounce
   * @returns {Stream} new debounced stream
   */
  function debounce(period, stream) {
  	return new Stream(new Debounce(period, stream.source));
  }

  function Debounce(dt, source) {
  	this.dt = dt;
  	this.source = source;
  }

  Debounce.prototype.run = function(sink, scheduler) {
  	return new DebounceSink(this.dt, this.source, sink, scheduler);
  };

  function DebounceSink(dt, source, sink, scheduler) {
  	this.dt = dt;
  	this.sink = sink;
  	this.scheduler = scheduler;
  	this.value = void 0;
  	this.timer = null;

  	var sourceDisposable = source.run(this, scheduler);
  	this.disposable = dispose.all([this, sourceDisposable]);
  }

  DebounceSink.prototype.event = function(t, x) {
  	this._clearTimer();
  	this.value = x;
  	this.timer = this.scheduler.delay(this.dt, PropagateTask.event(x, this.sink));
  };

  DebounceSink.prototype.end = function(t, x) {
  	if(this._clearTimer()) {
  		this.sink.event(t, this.value);
  		this.value = void 0;
  	}
  	this.sink.end(t, x);
  };

  DebounceSink.prototype.error = function(t, x) {
  	this._clearTimer();
  	this.sink.error(t, x);
  };

  DebounceSink.prototype.dispose = function() {
  	this._clearTimer();
  };

  DebounceSink.prototype._clearTimer = function() {
  	if(this.timer === null) {
  		return false;
  	}
  	this.timer.dispose();
  	this.timer = null;
  	return true;
  };
  });

  var limit$1 = interopDefault(limit);
  var debounce$1 = limit.debounce;
  var throttle$1 = limit.throttle;

var require$$3$3 = Object.freeze({
  	default: limit$1,
  	debounce: debounce$1,
  	throttle: throttle$1
  });

  var promises = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);
  var fatal = interopDefault(require$$1$1);
  var just = interopDefault(require$$0$2).of;

  exports.fromPromise = fromPromise;
  exports.awaitPromises = awaitPromises;

  /**
   * Create a stream containing only the promise's fulfillment
   * value at the time it fulfills.
   * @param {Promise<T>} p promise
   * @return {Stream<T>} stream containing promise's fulfillment value.
   *  If the promise rejects, the stream will error
   */
  function fromPromise(p) {
  	return awaitPromises(just(p));
  }

  /**
   * Turn a Stream<Promise<T>> into Stream<T> by awaiting each promise.
   * Event order is preserved.
   * @param {Stream<Promise<T>>} stream
   * @return {Stream<T>} stream of fulfillment values.  The stream will
   * error if any promise rejects.
   */
  function awaitPromises(stream) {
  	return new Stream(new Await(stream.source));
  }

  function Await(source) {
  	this.source = source;
  }

  Await.prototype.run = function(sink, scheduler) {
  	return this.source.run(new AwaitSink(sink, scheduler), scheduler);
  };

  function AwaitSink(sink, scheduler) {
  	this.sink = sink;
  	this.scheduler = scheduler;
  	this.queue = Promise.resolve();
  	var self = this;

  	// Pre-create closures, to avoid creating them per event
  	this._eventBound = function(x) {
  		self.sink.event(self.scheduler.now(), x);
  	};

  	this._endBound = function(x) {
  		self.sink.end(self.scheduler.now(), x);
  	};

  	this._errorBound = function(e) {
  		self.sink.error(self.scheduler.now(), e);
  	};
  }

  AwaitSink.prototype.event = function(t, promise) {
  	var self = this;
  	this.queue = this.queue.then(function() {
  		return self._event(promise);
  	}).catch(this._errorBound);
  };

  AwaitSink.prototype.end = function(t, x) {
  	var self = this;
  	this.queue = this.queue.then(function() {
  		return self._end(x);
  	}).catch(this._errorBound);
  };

  AwaitSink.prototype.error = function(t, e) {
  	var self = this;
  	// Don't resolve error values, propagate directly
  	this.queue = this.queue.then(function() {
  		return self._errorBound(e);
  	}).catch(fatal);
  };

  AwaitSink.prototype._event = function(promise) {
  	return promise.then(this._eventBound);
  };

  AwaitSink.prototype._end = function(x) {
  	return Promise.resolve(x).then(this._endBound);
  };
  });

  var promises$1 = interopDefault(promises);
  var awaitPromises = promises.awaitPromises;
  var fromPromise$1 = promises.fromPromise;

var require$$2$7 = Object.freeze({
  	default: promises$1,
  	awaitPromises: awaitPromises,
  	fromPromise: fromPromise$1
  });

  var SafeSink = createCommonjsModule(function (module) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  module.exports = SafeSink;

  function SafeSink(sink) {
  	this.sink = sink;
  	this.active = true;
  }

  SafeSink.prototype.event = function(t, x) {
  	if(!this.active) {
  		return;
  	}
  	this.sink.event(t, x);
  };

  SafeSink.prototype.end = function(t, x) {
  	if(!this.active) {
  		return;
  	}
  	this.disable();
  	this.sink.end(t, x);
  };

  SafeSink.prototype.error = function(t, e) {
  	this.disable();
  	this.sink.error(t, e);
  };

  SafeSink.prototype.disable = function() {
  	this.active = false;
  	return this.sink;
  }
  });

  var SafeSink$1 = interopDefault(SafeSink);


  var require$$5$2 = Object.freeze({
  	default: SafeSink$1
  });

  var errors = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);
  var SafeSink = interopDefault(require$$5$2);
  var Pipe = interopDefault(require$$4);
  var dispose = interopDefault(require$$3);
  var tryEvent = interopDefault(require$$2$4);
  var isPromise = interopDefault(require$$1).isPromise;
  var PropagateTask = interopDefault(require$$0$3);

  exports.flatMapError = recoverWith;
  exports.recoverWith  = recoverWith;
  exports.throwError   = throwError;

  /**
   * If stream encounters an error, recover and continue with items from stream
   * returned by f.
   * @param {function(error:*):Stream} f function which returns a new stream
   * @param {Stream} stream
   * @returns {Stream} new stream which will recover from an error by calling f
   */
  function recoverWith(f, stream) {
  	return new Stream(new RecoverWith(f, stream.source));
  }

  /**
   * Create a stream containing only an error
   * @param {*} e error value, preferably an Error or Error subtype
   * @returns {Stream} new stream containing only an error
   */
  function throwError(e) {
  	return new Stream(new ErrorSource(e));
  }

  function ErrorSource(e) {
  	this.value = e;
  }

  ErrorSource.prototype.run = function(sink, scheduler) {
  	return scheduler.asap(new PropagateTask(runError, this.value, sink));
  };

  function runError(t, e, sink) {
  	sink.error(t, e);
  }

  function RecoverWith(f, source) {
  	this.f = f;
  	this.source = source;
  }

  RecoverWith.prototype.run = function(sink, scheduler) {
  	return new RecoverWithSink(this.f, this.source, sink, scheduler);
  };

  function RecoverWithSink(f, source, sink, scheduler) {
  	this.f = f;
  	this.sink = new SafeSink(sink);
  	this.scheduler = scheduler;
  	this.disposable = source.run(this, scheduler);
  }

  RecoverWithSink.prototype.event = function(t, x) {
  		tryEvent.tryEvent(t, x, this.sink);
  }

  RecoverWithSink.prototype.end = function(t, x) {
  		tryEvent.tryEnd(t, x, this.sink);
  }

  RecoverWithSink.prototype.error = function(t, e) {
  	var nextSink = this.sink.disable();

  	dispose.tryDispose(t, this.disposable, this.sink);
  	this._startNext(t, e, nextSink);
  };

  RecoverWithSink.prototype._startNext = function(t, x, sink) {
  	try {
  		this.disposable = this._continue(this.f, x, sink);
  	} catch(e) {
  		sink.error(t, e);
  	}
  };

  RecoverWithSink.prototype._continue = function(f, x, sink) {
  	var stream = f(x);
  	return stream.source.run(sink, this.scheduler);
  };

  RecoverWithSink.prototype.dispose = function() {
  	return this.disposable.dispose();
  };
  });

  var errors$1 = interopDefault(errors);
  var throwError$1 = errors.throwError;
  var recoverWith$1 = errors.recoverWith;
  var flatMapError$1 = errors.flatMapError;

var require$$1$11 = Object.freeze({
  	default: errors$1,
  	throwError: throwError$1,
  	recoverWith: recoverWith$1,
  	flatMapError: flatMapError$1
  });

  var most = createCommonjsModule(function (module, exports) {
  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  /** @author Brian Cavalier */
  /** @author John Hann */

  var Stream = interopDefault(require$$6);
  var base = interopDefault(require$$0);
  var core = interopDefault(require$$0$2);
  var from = interopDefault(require$$33).from;
  var periodic = interopDefault(require$$32).periodic;
  var symbolObservable = interopDefault(require$$31).default;

  /**
   * Core stream type
   * @type {Stream}
   */
  exports.Stream = Stream;

  // Add of and empty to constructor for fantasy-land compat
  exports.of       = Stream.of    = core.of;
  exports.just     = core.of; // easier ES6 import alias
  exports.empty    = Stream.empty = core.empty;
  exports.never    = core.never;
  exports.from     = from;
  exports.periodic = periodic;

  //-----------------------------------------------------------------------
  // Draft ES Observable proposal interop
  // https://github.com/zenparsing/es-observable

  var subscribe = interopDefault(require$$30).subscribe;

  Stream.prototype.subscribe = function(subscriber) {
  	return subscribe(subscriber, this);
  };

  Stream.prototype[symbolObservable] = function() {
  	return this;
  };

  //-----------------------------------------------------------------------
  // Fluent adapter

  var thru = interopDefault(require$$29).thru;

  /**
   * Adapt a functional stream transform to fluent style.
   * It applies f to the this stream object
   * @param  {function(s: Stream): Stream} f function that
   * receives the stream itself and must return a new stream
   * @return {Stream}
   */
  Stream.prototype.thru = function(f) {
  	return thru(f, this);
  }

  //-----------------------------------------------------------------------
  // Adapting other sources

  var events = interopDefault(require$$28);

  /**
   * Create a stream of events from the supplied EventTarget or EventEmitter
   * @param {String} event event name
   * @param {EventTarget|EventEmitter} source EventTarget or EventEmitter. The source
   *  must support either addEventListener/removeEventListener (w3c EventTarget:
   *  http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventTarget),
   *  or addListener/removeListener (node EventEmitter: http://nodejs.org/api/events.html)
   * @returns {Stream} stream of events of the specified type from the source
   */
  exports.fromEvent = events.fromEvent;

  //-----------------------------------------------------------------------
  // Observing

  var observe = interopDefault(require$$27);

  exports.observe = observe.observe;
  exports.forEach = observe.observe;
  exports.drain   = observe.drain;

  /**
   * Process all the events in the stream
   * @returns {Promise} promise that fulfills when the stream ends, or rejects
   *  if the stream fails with an unhandled error.
   */
  Stream.prototype.observe = Stream.prototype.forEach = function(f) {
  	return observe.observe(f, this);
  };

  /**
   * Consume all events in the stream, without providing a function to process each.
   * This causes a stream to become active and begin emitting events, and is useful
   * in cases where all processing has been setup upstream via other combinators, and
   * there is no need to process the terminal events.
   * @returns {Promise} promise that fulfills when the stream ends, or rejects
   *  if the stream fails with an unhandled error.
   */
  Stream.prototype.drain = function() {
  	return observe.drain(this);
  };

  //-------------------------------------------------------

  var loop = interopDefault(require$$26).loop;

  exports.loop = loop;

  /**
   * Generalized feedback loop. Call a stepper function for each event. The stepper
   * will be called with 2 params: the current seed and the an event value.  It must
   * return a new { seed, value } pair. The `seed` will be fed back into the next
   * invocation of stepper, and the `value` will be propagated as the event value.
   * @param {function(seed:*, value:*):{seed:*, value:*}} stepper loop step function
   * @param {*} seed initial seed value passed to first stepper call
   * @returns {Stream} new stream whose values are the `value` field of the objects
   * returned by the stepper
   */
  Stream.prototype.loop = function(stepper, seed) {
  	return loop(stepper, seed, this);
  };

  //-------------------------------------------------------

  var accumulate = interopDefault(require$$25);

  exports.scan   = accumulate.scan;
  exports.reduce = accumulate.reduce;

  /**
   * Create a stream containing successive reduce results of applying f to
   * the previous reduce result and the current stream item.
   * @param {function(result:*, x:*):*} f reducer function
   * @param {*} initial initial value
   * @returns {Stream} new stream containing successive reduce results
   */
  Stream.prototype.scan = function(f, initial) {
  	return accumulate.scan(f, initial, this);
  };

  /**
   * Reduce the stream to produce a single result.  Note that reducing an infinite
   * stream will return a Promise that never fulfills, but that may reject if an error
   * occurs.
   * @param {function(result:*, x:*):*} f reducer function
   * @param {*} initial optional initial value
   * @returns {Promise} promise for the file result of the reduce
   */
  Stream.prototype.reduce = function(f, initial) {
  	return accumulate.reduce(f, initial, this);
  };

  //-----------------------------------------------------------------------
  // Building and extending

  var unfold = interopDefault(require$$24);
  var iterate = interopDefault(require$$23);
  var generate = interopDefault(require$$22);
  var build = interopDefault(require$$21);

  exports.unfold    = unfold.unfold;
  exports.iterate   = iterate.iterate;
  exports.generate  = generate.generate;
  exports.concat    = build.concat;
  exports.startWith = build.cons;

  /**
   * @param {Stream} tail
   * @returns {Stream} new stream containing all items in this followed by
   *  all items in tail
   */
  Stream.prototype.concat = function(tail) {
  	return build.concat(this, tail);
  };

  /**
   * @param {*} x value to prepend
   * @returns {Stream} a new stream with x prepended
   */
  Stream.prototype.startWith = function(x) {
  	return build.cons(x, this);
  };

  //-----------------------------------------------------------------------
  // Transforming

  var transform = interopDefault(require$$7);
  var applicative = interopDefault(require$$19);

  exports.map      = transform.map;
  exports.constant = transform.constant;
  exports.tap      = transform.tap;
  exports.ap       = applicative.ap;

  /**
   * Transform each value in the stream by applying f to each
   * @param {function(*):*} f mapping function
   * @returns {Stream} stream containing items transformed by f
   */
  Stream.prototype.map = function(f) {
  	return transform.map(f, this);
  };

  /**
   * Assume this stream contains functions, and apply each function to each item
   * in the provided stream.  This generates, in effect, a cross product.
   * @param {Stream} xs stream of items to which
   * @returns {Stream} stream containing the cross product of items
   */
  Stream.prototype.ap = function(xs) {
  	return applicative.ap(this, xs);
  };

  /**
   * Replace each value in the stream with x
   * @param {*} x
   * @returns {Stream} stream containing items replaced with x
   */
  Stream.prototype.constant = function(x) {
  	return transform.constant(x, this);
  };

  /**
   * Perform a side effect for each item in the stream
   * @param {function(x:*):*} f side effect to execute for each item. The
   *  return value will be discarded.
   * @returns {Stream} new stream containing the same items as this stream
   */
  Stream.prototype.tap = function(f) {
  	return transform.tap(f, this);
  };

  //-----------------------------------------------------------------------
  // Transducer support

  var transduce = interopDefault(require$$18);

  exports.transduce = transduce.transduce;

  /**
   * Transform this stream by passing its events through a transducer.
   * @param  {function} transducer transducer function
   * @return {Stream} stream of events transformed by the transducer
   */
  Stream.prototype.transduce = function(transducer) {
  	return transduce.transduce(transducer, this);
  };

  //-----------------------------------------------------------------------
  // FlatMapping

  var flatMap = interopDefault(require$$0$10);

  exports.flatMap = exports.chain = flatMap.flatMap;
  exports.join    = flatMap.join;

  /**
   * Map each value in the stream to a new stream, and merge it into the
   * returned outer stream. Event arrival times are preserved.
   * @param {function(x:*):Stream} f chaining function, must return a Stream
   * @returns {Stream} new stream containing all events from each stream returned by f
   */
  Stream.prototype.flatMap = Stream.prototype.chain = function(f) {
  	return flatMap.flatMap(f, this);
  };

  /**
   * Monadic join. Flatten a Stream<Stream<X>> to Stream<X> by merging inner
   * streams to the outer. Event arrival times are preserved.
   * @returns {Stream<X>} new stream containing all events of all inner streams
   */
  Stream.prototype.join = function() {
  	return flatMap.join(this);
  };

  var continueWith = interopDefault(require$$0$9).continueWith;

  exports.continueWith = continueWith;
  exports.flatMapEnd = continueWith;

  /**
   * Map the end event to a new stream, and begin emitting its values.
   * @param {function(x:*):Stream} f function that receives the end event value,
   * and *must* return a new Stream to continue with.
   * @returns {Stream} new stream that emits all events from the original stream,
   * followed by all events from the stream returned by f.
   */
  Stream.prototype.continueWith = Stream.prototype.flatMapEnd = function(f) {
  	return continueWith(f, this);
  };

  var concatMap = interopDefault(require$$15).concatMap;

  exports.concatMap = concatMap;

  Stream.prototype.concatMap = function(f) {
  	return concatMap(f, this);
  };

  //-----------------------------------------------------------------------
  // Concurrent merging

  var mergeConcurrently = interopDefault(require$$0$11);

  exports.mergeConcurrently = mergeConcurrently.mergeConcurrently;

  /**
   * Flatten a Stream<Stream<X>> to Stream<X> by merging inner
   * streams to the outer, limiting the number of inner streams that may
   * be active concurrently.
   * @param {number} concurrency at most this many inner streams will be
   *  allowed to be active concurrently.
   * @return {Stream<X>} new stream containing all events of all inner
   *  streams, with limited concurrency.
   */
  Stream.prototype.mergeConcurrently = function(concurrency) {
  	return mergeConcurrently.mergeConcurrently(concurrency, this);
  };

  //-----------------------------------------------------------------------
  // Merging

  var merge = interopDefault(require$$13);

  exports.merge = merge.merge;
  exports.mergeArray = merge.mergeArray;

  /**
   * Merge this stream and all the provided streams
   * @returns {Stream} stream containing items from this stream and s in time
   * order.  If two events are simultaneous they will be merged in
   * arbitrary order.
   */
  Stream.prototype.merge = function(/*...streams*/) {
  	return merge.mergeArray(base.cons(this, arguments));
  };

  //-----------------------------------------------------------------------
  // Combining

  var combine = interopDefault(require$$1$8);

  exports.combine = combine.combine;
  exports.combineArray = combine.combineArray;

  /**
   * Combine latest events from all input streams
   * @param {function(...events):*} f function to combine most recent events
   * @returns {Stream} stream containing the result of applying f to the most recent
   *  event of each input stream, whenever a new event arrives on any stream.
   */
  Stream.prototype.combine = function(f /*, ...streams*/) {
  	return combine.combineArray(f, base.replace(this, 0, arguments));
  };

  //-----------------------------------------------------------------------
  // Sampling

  var sample = interopDefault(require$$11);

  exports.sample = sample.sample;
  exports.sampleWith = sample.sampleWith;

  /**
   * When an event arrives on sampler, emit the latest event value from stream.
   * @param {Stream} sampler stream of events at whose arrival time
   *  signal's latest value will be propagated
   * @returns {Stream} sampled stream of values
   */
  Stream.prototype.sampleWith = function(sampler) {
  	return sample.sampleWith(sampler, this);
  };

  /**
   * When an event arrives on this stream, emit the result of calling f with the latest
   * values of all streams being sampled
   * @param {function(...values):*} f function to apply to each set of sampled values
   * @returns {Stream} stream of sampled and transformed values
   */
  Stream.prototype.sample = function(f /* ...streams */) {
  	return sample.sampleArray(f, this, base.tail(arguments));
  };

  //-----------------------------------------------------------------------
  // Zipping

  var zip = interopDefault(require$$10);

  exports.zip = zip.zip;

  /**
   * Pair-wise combine items with those in s. Given 2 streams:
   * [1,2,3] zipWith f [4,5,6] -> [f(1,4),f(2,5),f(3,6)]
   * Note: zip causes fast streams to buffer and wait for slow streams.
   * @param {function(a:Stream, b:Stream, ...):*} f function to combine items
   * @returns {Stream} new stream containing pairs
   */
  Stream.prototype.zip = function(f /*, ...streams*/) {
  	return zip.zipArray(f, base.replace(this, 0, arguments));
  };

  //-----------------------------------------------------------------------
  // Switching

  var switchLatest = interopDefault(require$$9).switch;

  exports.switch       = switchLatest;
  exports.switchLatest = switchLatest;

  /**
   * Given a stream of streams, return a new stream that adopts the behavior
   * of the most recent inner stream.
   * @returns {Stream} switching stream
   */
  Stream.prototype.switch = Stream.prototype.switchLatest = function() {
  	return switchLatest(this);
  };

  //-----------------------------------------------------------------------
  // Filtering

  var filter = interopDefault(require$$8);

  exports.filter          = filter.filter;
  exports.skipRepeats     = exports.distinct   = filter.skipRepeats;
  exports.skipRepeatsWith = exports.distinctBy = filter.skipRepeatsWith;

  /**
   * Retain only items matching a predicate
   * stream:                           -12345678-
   * filter(x => x % 2 === 0, stream): --2-4-6-8-
   * @param {function(x:*):boolean} p filtering predicate called for each item
   * @returns {Stream} stream containing only items for which predicate returns truthy
   */
  Stream.prototype.filter = function(p) {
  	return filter.filter(p, this);
  };

  /**
   * Skip repeated events, using === to compare items
   * stream:           -abbcd-
   * distinct(stream): -ab-cd-
   * @returns {Stream} stream with no repeated events
   */
  Stream.prototype.skipRepeats = function() {
  	return filter.skipRepeats(this);
  };

  /**
   * Skip repeated events, using supplied equals function to compare items
   * @param {function(a:*, b:*):boolean} equals function to compare items
   * @returns {Stream} stream with no repeated events
   */
  Stream.prototype.skipRepeatsWith = function(equals) {
  	return filter.skipRepeatsWith(equals, this);
  };

  //-----------------------------------------------------------------------
  // Slicing

  var slice = interopDefault(require$$7$1);

  exports.take      = slice.take;
  exports.skip      = slice.skip;
  exports.slice     = slice.slice;
  exports.takeWhile = slice.takeWhile;
  exports.skipWhile = slice.skipWhile;

  /**
   * stream:          -abcd-
   * take(2, stream): -ab|
   * @param {Number} n take up to this many events
   * @returns {Stream} stream containing at most the first n items from this stream
   */
  Stream.prototype.take = function(n) {
  	return slice.take(n, this);
  };

  /**
   * stream:          -abcd->
   * skip(2, stream): ---cd->
   * @param {Number} n skip this many events
   * @returns {Stream} stream not containing the first n events
   */
  Stream.prototype.skip = function(n) {
  	return slice.skip(n, this);
  };

  /**
   * Slice a stream by event index. Equivalent to, but more efficient than
   * stream.take(end).skip(start);
   * NOTE: Negative start and end are not supported
   * @param {Number} start skip all events before the start index
   * @param {Number} end allow all events from the start index to the end index
   * @returns {Stream} stream containing items where start <= index < end
   */
  Stream.prototype.slice = function(start, end) {
  	return slice.slice(start, end, this);
  };

  /**
   * stream:                        -123451234->
   * takeWhile(x => x < 5, stream): -1234|
   * @param {function(x:*):boolean} p predicate
   * @returns {Stream} stream containing items up to, but not including, the
   * first item for which p returns falsy.
   */
  Stream.prototype.takeWhile = function(p) {
  	return slice.takeWhile(p, this);
  };

  /**
   * stream:                        -123451234->
   * skipWhile(x => x < 5, stream): -----51234->
   * @param {function(x:*):boolean} p predicate
   * @returns {Stream} stream containing items following *and including* the
   * first item for which p returns falsy.
   */
  Stream.prototype.skipWhile = function(p) {
  	return slice.skipWhile(p, this);
  };

  //-----------------------------------------------------------------------
  // Time slicing

  var timeslice = interopDefault(require$$6$1);

  exports.until  = exports.takeUntil = timeslice.takeUntil;
  exports.since  = exports.skipUntil = timeslice.skipUntil;
  exports.during = timeslice.during;

  /**
   * stream:                    -a-b-c-d-e-f-g->
   * signal:                    -------x
   * takeUntil(signal, stream): -a-b-c-|
   * @param {Stream} signal retain only events in stream before the first
   * event in signal
   * @returns {Stream} new stream containing only events that occur before
   * the first event in signal.
   */
  Stream.prototype.until = Stream.prototype.takeUntil = function(signal) {
  	return timeslice.takeUntil(signal, this);
  };

  /**
   * stream:                    -a-b-c-d-e-f-g->
   * signal:                    -------x
   * takeUntil(signal, stream): -------d-e-f-g->
   * @param {Stream} signal retain only events in stream at or after the first
   * event in signal
   * @returns {Stream} new stream containing only events that occur after
   * the first event in signal.
   */
  Stream.prototype.since = Stream.prototype.skipUntil = function(signal) {
  	return timeslice.skipUntil(signal, this);
  };

  /**
   * stream:                    -a-b-c-d-e-f-g->
   * timeWindow:                -----s
   * s:                               -----t
   * stream.during(timeWindow): -----c-d-e-|
   * @param {Stream<Stream>} timeWindow a stream whose first event (s) represents
   *  the window start time.  That event (s) is itself a stream whose first event (t)
   *  represents the window end time
   * @returns {Stream} new stream containing only events within the provided timespan
   */
  Stream.prototype.during = function(timeWindow) {
  	return timeslice.during(timeWindow, this);
  };

  //-----------------------------------------------------------------------
  // Delaying

  var delay = interopDefault(require$$5$1).delay;

  exports.delay = delay;

  /**
   * @param {Number} delayTime milliseconds to delay each item
   * @returns {Stream} new stream containing the same items, but delayed by ms
   */
  Stream.prototype.delay = function(delayTime) {
  	return delay(delayTime, this);
  };

  //-----------------------------------------------------------------------
  // Getting event timestamp

  var timestamp = interopDefault(require$$4$2).timestamp;

  exports.timestamp = timestamp;

  /**
   * Expose event timestamps into the stream. Turns a Stream<X> into
   * Stream<{time:t, value:X}>
   * @returns {Stream<{time:number, value:*}>}
   */
  Stream.prototype.timestamp = function() {
  	return timestamp(this);
  };

  //-----------------------------------------------------------------------
  // Rate limiting

  var limit = interopDefault(require$$3$3);

  exports.throttle = limit.throttle;
  exports.debounce = limit.debounce;

  /**
   * Limit the rate of events
   * stream:              abcd----abcd----
   * throttle(2, stream): a-c-----a-c-----
   * @param {Number} period time to suppress events
   * @returns {Stream} new stream that skips events for throttle period
   */
  Stream.prototype.throttle = function(period) {
  	return limit.throttle(period, this);
  };

  /**
   * Wait for a burst of events to subside and emit only the last event in the burst
   * stream:              abcd----abcd----
   * debounce(2, stream): -----d-------d--
   * @param {Number} period events occuring more frequently than this
   *  on the provided scheduler will be suppressed
   * @returns {Stream} new debounced stream
   */
  Stream.prototype.debounce = function(period) {
  	return limit.debounce(period, this);
  };

  //-----------------------------------------------------------------------
  // Awaiting Promises

  var promises = interopDefault(require$$2$7);

  exports.fromPromise = promises.fromPromise;
  exports['await']       = promises.awaitPromises;

  /**
   * Await promises, turning a Stream<Promise<X>> into Stream<X>.  Preserves
   * event order, but timeshifts events based on promise resolution time.
   * @returns {Stream<X>} stream containing non-promise values
   */
  Stream.prototype['await'] = function() {
  	return promises.awaitPromises(this);
  };

  //-----------------------------------------------------------------------
  // Error handling

  var errors = interopDefault(require$$1$11);

  exports.recoverWith  = errors.flatMapError;
  exports.flatMapError = errors.flatMapError;
  exports.throwError   = errors.throwError;

  /**
   * If this stream encounters an error, recover and continue with items from stream
   * returned by f.
   * stream:                  -a-b-c-X-
   * f(X):                           d-e-f-g-
   * flatMapError(f, stream): -a-b-c-d-e-f-g-
   * @param {function(error:*):Stream} f function which returns a new stream
   * @returns {Stream} new stream which will recover from an error by calling f
   */
  Stream.prototype.recoverWith = Stream.prototype.flatMapError = function(f) {
  	return errors.flatMapError(f, this);
  };

  //-----------------------------------------------------------------------
  // Multicasting

  var multicast = interopDefault(require$$0$1).default;

  exports.multicast = multicast;

  /**
   * Transform the stream into multicast stream.  That means that many subscribers
   * to the stream will not cause multiple invocations of the internal machinery.
   * @returns {Stream} new stream which will multicast events to all observers.
   */
  Stream.prototype.multicast = function() {
  	return multicast(this);
  };
  });

  var most$1 = interopDefault(most);
  var multicast = most.multicast;
  var throwError = most.throwError;
  var flatMapError = most.flatMapError;
  var recoverWith = most.recoverWith;
  var fromPromise = most.fromPromise;
  var debounce = most.debounce;
  var throttle = most.throttle;
  var timestamp = most.timestamp;
  var delay = most.delay;
  var during = most.during;
  var since = most.since;
  var skipUntil = most.skipUntil;
  var until = most.until;
  var takeUntil = most.takeUntil;
  var skipWhile = most.skipWhile;
  var takeWhile = most.takeWhile;
  var slice = most.slice;
  var skip = most.skip;
  var take = most.take;
  var skipRepeatsWith = most.skipRepeatsWith;
  var distinctBy = most.distinctBy;
  var skipRepeats = most.skipRepeats;
  var distinct = most.distinct;
  var filter = most.filter;
  var switchLatest = most.switchLatest;
  var zip = most.zip;
  var sampleWith = most.sampleWith;
  var sample = most.sample;
  var combineArray = most.combineArray;
  var combine = most.combine;
  var mergeArray = most.mergeArray;
  var merge = most.merge;
  var mergeConcurrently = most.mergeConcurrently;
  var concatMap = most.concatMap;
  var flatMapEnd = most.flatMapEnd;
  var continueWith = most.continueWith;
  var join = most.join;
  var flatMap = most.flatMap;
  var chain = most.chain;
  var transduce = most.transduce;
  var ap = most.ap;
  var tap = most.tap;
  var constant = most.constant;
  var map = most.map;
  var startWith = most.startWith;
  var concat = most.concat;
  var generate = most.generate;
  var iterate = most.iterate;
  var unfold = most.unfold;
  var reduce = most.reduce;
  var scan = most.scan;
  var loop = most.loop;
  var drain = most.drain;
  var forEach = most.forEach;
  var observe = most.observe;
  var fromEvent = most.fromEvent;
  var periodic = most.periodic;
  var from = most.from;
  var never = most.never;
  var empty = most.empty;
  var just = most.just;
  var of = most.of;
  var Stream = most.Stream;

  exports['default'] = most$1;
  exports.multicast = multicast;
  exports.throwError = throwError;
  exports.flatMapError = flatMapError;
  exports.recoverWith = recoverWith;
  exports.fromPromise = fromPromise;
  exports.debounce = debounce;
  exports.throttle = throttle;
  exports.timestamp = timestamp;
  exports.delay = delay;
  exports.during = during;
  exports.since = since;
  exports.skipUntil = skipUntil;
  exports.until = until;
  exports.takeUntil = takeUntil;
  exports.skipWhile = skipWhile;
  exports.takeWhile = takeWhile;
  exports.slice = slice;
  exports.skip = skip;
  exports.take = take;
  exports.skipRepeatsWith = skipRepeatsWith;
  exports.distinctBy = distinctBy;
  exports.skipRepeats = skipRepeats;
  exports.distinct = distinct;
  exports.filter = filter;
  exports.switchLatest = switchLatest;
  exports.zip = zip;
  exports.sampleWith = sampleWith;
  exports.sample = sample;
  exports.combineArray = combineArray;
  exports.combine = combine;
  exports.mergeArray = mergeArray;
  exports.merge = merge;
  exports.mergeConcurrently = mergeConcurrently;
  exports.concatMap = concatMap;
  exports.flatMapEnd = flatMapEnd;
  exports.continueWith = continueWith;
  exports.join = join;
  exports.flatMap = flatMap;
  exports.chain = chain;
  exports.transduce = transduce;
  exports.ap = ap;
  exports.tap = tap;
  exports.constant = constant;
  exports.map = map;
  exports.startWith = startWith;
  exports.concat = concat;
  exports.generate = generate;
  exports.iterate = iterate;
  exports.unfold = unfold;
  exports.reduce = reduce;
  exports.scan = scan;
  exports.loop = loop;
  exports.drain = drain;
  exports.forEach = forEach;
  exports.observe = observe;
  exports.fromEvent = fromEvent;
  exports.periodic = periodic;
  exports.from = from;
  exports.never = never;
  exports.empty = empty;
  exports.just = just;
  exports.of = of;
  exports.Stream = Stream;

  Object.defineProperty(exports, '__esModule', { value: true });

}));