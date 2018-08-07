require('buba/register')
var Benchmark = require('benchmark');
var most = require('../../src/index');
var rx = require('rx');
var rxjs = require('@reactivex/rxjs');
var rxjs6 = require('rxjs');
var rxjs6Operators = require('rxjs/operators');
var kefir = require('kefir');
var bacon = require('baconjs');
var highland = require('highland');
var xs = require('xstream').default;

var runners = require('./runners');
var kefirFromArray = runners.kefirFromArray;

// Create a stream from an Array of n integers
// filter out odds, map remaining evens by adding 1, then reduce by summing
var n = runners.getIntArg(1000000);
var a = new Array(n);
for(var i = 0; i< a.length; ++i) {
  a[i] = i;
}

var suite = Benchmark.Suite('filter -> map -> reduce ' + n + ' integers');
var options = {
  defer: true,
  onError: function(e) {
    e.currentTarget.failure = e.error;
  }
};

suite
  .add('most', function(deferred) {
    runners.runMost(deferred, most.from(a).filter(even).map(add1).reduce(sum, 0));
  }, options)
  .add('rx 4', function(deferred) {
    runners.runRx(deferred, rx.Observable.fromArray(a).filter(even).map(add1).reduce(sum, 0));
  }, options)
  .add('rx 5', function(deferred) {
    runners.runRx5(deferred,
      rxjs.Observable.from(a).filter(even).map(add1).reduce(sum, 0));
  }, options)
  .add('rx 6', function(deferred) {
    runners.runRx6(deferred,
      rxjs6.from(a).pipe(
        rxjs6Operators.filter(even),
        rxjs6Operators.map(add1),
        rxjs6Operators.reduce(sum, 0))
      )
  }, options)
  .add('xstream', function(deferred) {
    runners.runXstream(deferred, xs.fromArray(a).filter(even).map(add1).fold(sum, 0).last())
  }, options)
  .add('kefir', function(deferred) {
    runners.runKefir(deferred, kefirFromArray(a).filter(even).map(add1).scan(sum, 0).last());
  }, options)
  .add('bacon', function(deferred) {
    runners.runBacon(deferred, bacon.fromArray(a).filter(even).map(add1).reduce(0, sum));
  }, options)
  .add('highland', function(deferred) {
    runners.runHighland(deferred, highland(a).filter(even).map(add1).reduce(0, sum));
  }, options);

runners.runSuite(suite);

function add1(x) {
  return x + 1;
}

function even(x) {
  return x % 2 === 0;
}

function sum(x, y) {
  return x + y;
}
