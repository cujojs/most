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
var xstreamDropRepeats = require('xstream/extra/dropRepeats').default;

// Create a stream from an Array of n integers
// filter out odds, map remaining evens by adding 1, then reduce by summing
var n = runners.getIntArg(1000000);
var a = new Array(n);
for(var i = 0, j = 0; i< a.length; i+=2, ++j) {
  a[i] = a[i+1] = j;
}

var suite = Benchmark.Suite('skipRepeats -> reduce 2 x ' + n + ' integers');
var options = {
  defer: true,
  onError: function(e) {
    e.currentTarget.failure = e.error;
  }
};

suite
  .add('most', function(deferred) {
    runners.runMost(deferred, most.from(a).skipRepeats().reduce(sum, 0));
  }, options)
  .add('rx 4', function(deferred) {
    runners.runRx(deferred, rx.Observable.fromArray(a).distinctUntilChanged().reduce(sum, 0));
  }, options)
  .add('rx 5', function(deferred) {
    runners.runRx5(deferred, rxjs.Observable.from(a).distinctUntilChanged().reduce(sum, 0));
  }, options)
  .add('rx 6', function(deferred) {
    runners.runRx6(deferred, 
      rxjs6.from(a).pipe(
        rxjs6Operators.distinctUntilChanged(),
        rxjs6Operators.reduce(sum, 0))
    );
  }, options)
  .add('xstream', function(deferred) {
    runners.runXstream(deferred, xs.fromArray(a).compose(xstreamDropRepeats()).fold(sum, 0).last());
  }, options)
  .add('kefir', function(deferred) {
    runners.runKefir(deferred, kefirFromArray(a).skipDuplicates().scan(sum, 0).last());
  }, options)
  .add('bacon', function(deferred) {
    runners.runBacon(deferred, bacon.fromArray(a).skipDuplicates().reduce(0, sum));
  }, options)

runners.runSuite(suite);

function sum(x, y) {
  return x + y;
}
