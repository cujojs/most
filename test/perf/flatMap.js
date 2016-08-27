var Benchmark = require('benchmark');
var most = require('../../src/index');
var rx = require('rx');
var rxjs = require('@reactivex/rxjs')
var kefir = require('kefir');
var bacon = require('baconjs');
var highland = require('highland');

var runners = require('./runners');
var kefirFromArray = runners.kefirFromArray;

// flatMapping n streams, each containing m items.
// Results in a single stream that merges in n x m items
// In Array parlance: Take an Array containing n Arrays, each of length m,
// and flatten it to an Array of length n x m.
var mn = runners.getIntArg2(1000, 1000);
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

var suite = Benchmark.Suite('flatMap ' + mn[0] + ' x ' + mn[1] + ' streams');
var options = {
  defer: true,
  onError: function(e) {
    e.currentTarget.failure = e.error;
  }
};

suite
  .add('most', function(deferred) {
    runners.runMost(deferred, most.from(a).flatMap(most.from).reduce(sum, 0));
  }, options)
  .add('rx 4', function(deferred) {
    runners.runRx(deferred, rx.Observable.fromArray(a).flatMap(rx.Observable.fromArray).reduce(sum, 0));
  }, options)
  .add('rx 5', function(deferred) {
    runners.runRx5(deferred,
      rxjs.Observable.from(a).flatMap(
        function(x) {return rxjs.Observable.from(x)}).reduce(sum, 0))
  }, options)
  .add('kefir', function(deferred) {
    runners.runKefir(deferred, kefirFromArray(a).flatMap(kefirFromArray).scan(sum, 0).last());
  }, options)
  .add('bacon', function(deferred) {
    runners.runBacon(deferred, bacon.fromArray(a).flatMap(bacon.fromArray).reduce(0, sum));
  }, options)
  .add('highland', function(deferred) {
    runners.runHighland(deferred, highland(a).flatMap(highland).reduce(0, sum));
  }, options);

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
