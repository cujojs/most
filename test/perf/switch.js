require('buba/register')
var Benchmark = require('benchmark');
var most = require('../../src/index');
var rx = require('rx');
var rxjs = require('@reactivex/rxjs')
var kefir = require('kefir');
var bacon = require('baconjs');
var lodash = require('lodash');
var highland = require('highland');
var xs = require('xstream').default;

var runners = require('./runners');
var kefirFromArray = runners.kefirFromArray;

// Switching n streams, each containing m items.
// Because this creates streams from arrays, it ends up
// behaving like concatMap, but gives a sense of the
// relative overhead introduced by each lib's switching
// combinator.
var mn = runners.getIntArg2(10000, 1000);
var a = build(mn[0], mn[1]);

function build(m, n) {
  var a = new Array(n);
  for(var i = 0; i< a.length; ++i) {
    a[i] = buildArray(i*1000, m);
  }
  return a;
}

function buildArray(base, n) {
  var a = new Array(n);
  for(var i = 0; i< a.length; ++i) {
    a[i] = base + i;
  }
  return a;
}

var suite = Benchmark.Suite('switch ' + mn[0] + ' x ' + mn[1] + ' streams');
var options = {
  defer: true,
  onError: function(e) {
    e.currentTarget.failure = e.error;
  }
};

suite
  .add('most', function(deferred) {
    runners.runMost(deferred, most.from(a).map(most.from).switch().reduce(sum, 0));
  }, options)
  .add('rx 5', function(deferred) {
    runners.runRx5(deferred,
      rxjs.Observable.from(a).switchMap(
        function(x) {return rxjs.Observable.from(x)}).reduce(sum, 0))
  }, options)
  .add('rx 4', function(deferred) {
    runners.runRx(deferred,
      rx.Observable.fromArray(a).flatMapLatest(
        function(x) {return rx.Observable.fromArray(x)}).reduce(sum, 0));
  }, options)
  .add('xstream', function(deferred) {
    runners.runXstream(deferred, xs.fromArray(a).map(bacon.fromArray).flatten().fold(sum, 0).last());
  }, options)
  .add('kefir', function(deferred) {
    runners.runKefir(deferred, kefirFromArray(a).flatMapLatest(kefirFromArray).scan(sum, 0).last());
  }, options)
  .add('bacon', function(deferred) {
    runners.runBacon(deferred, bacon.fromArray(a).flatMapLatest(bacon.fromArray).reduce(0, sum));
  }, options)

runners.runSuite(suite);

function sum(x, y) {
  return x + y;
}

function even(x) {
  return x % 2 === 0;
}

function identity(x) {
  return x;
}
