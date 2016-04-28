'use strict';
var Benchmark = require('benchmark');
var most = require('../../most');
var dispose = require('../../lib/disposable/dispose');
var rx = require('rx');
var rxjs = require('@reactivex/rxjs')
var kefir = require('kefir');
var bacon = require('baconjs');
var lodash = require('lodash');
var highland = require('highland');

var runners = require('./runners');
var kefirFromArray = runners.kefirFromArray;

// Create a stream from an Array of n integers
// filter out odds, map remaining evens by adding 1, then reduce by summing
var mn = runners.getIntArg2(1000000, 100);
const m = mn[0];
const n = mn[1];
var a = buildArray(m);
const as = buildArray(n);
const mosts = as.map(most.of);
const rxjss = as.map(x => rxjs.Observable.of(x))

function buildArray(n) {
	var a = new Array(n);
	for(var i = 0; i< n; ++i) {
		a[i] = i;
	}
	return a;
}

var suite = Benchmark.Suite('sample ' + m + ' x ' + n + ' integers');
var options = {
	defer: true,
	onError: function(e) {
		e.currentTarget.failure = e.error;
	}
};

var Stream = most.Stream;
var combineArray = most.combineArray;

// Primary API: sample *one* stream with another
// This simplifies the implementation of sample, removing
// lots of nearly-duplicate code w/merge and combine
const sample = (f, sampler, s) =>
	new Stream(new Sample(f, sampler.source, s.source));

// Other variants can be build by combining/zipping/merging/etc
// arrays or varargs lists of streams.
// For example, to sample an array of streams, use combine:
const sampleArray = (f, sampler, ss) =>
	ss.length === 0 ? most.empty()
		: sample(f, sampler, combineArray(arrayOf, ss));

const arrayOf = (...args) => args;

class Sample {
	constructor(f, sampler, source) {
		this.f = f;
		this.sampler = sampler;
		this.source = source;
	}

	run(sink, scheduler) {
		const hold = new Hold(sink);
		// TODO: In which order should these be run?
		// It *shouldn't* matter, but in practice, it will
		const d1 = this.source.run(hold, scheduler);
		const d2 = this.sampler.run(new SampleSink(this.f, hold, sink), scheduler);

		return dispose.all([d1, d2]);
	}
}

class Hold {
	constructor(sink) {
		this.sink = sink;
		this.value = void 0;
		this.hasValue = false;
	}

	event(t, x) {
		this.value = x;
		this.hasValue = true;
	}

	error(t, x) {
		this.sink.error(t, e);
	}

	end() {}
}

class SampleSink {
	constructor(f, hold, sink) {
		this.sink = sink;
		this.f = f;
		this.hold = hold;
	}

	event(t, x) {
		if(this.hold.hasValue) {
			const f = this.f;
			this.sink.event(t, f(x, this.hold.value));
		}
	}

	error(t, e) {
		this.sink.error(t, e);
	}

	end(t, x) {
		this.sink.end(t, x);
	}
}

const m1 = most.of(1);

suite
	.add('most', function(deferred) {
		// runners.runMost(deferred, sample(sum, most.from(a), m1).reduce(sum, 0));
		runners.runMost(deferred, sampleArray(combineSamples, most.from(a), as.map(most.of)).reduce(sum, 0));
	}, options)
	.add('rx 5', function(deferred) {
		runners.runRx5(deferred,
			// rxjs.Observable.from(a).withLatestFrom(rxjs.Observable.of(1), sum).reduce(sum, 0));
			rxjs.Observable.fromArray(a).withLatestFrom(...rxjss, combineSamples).reduce(sum, 0));
	}, options)
	// .add('kefir', function(deferred) {
	// 	runners.runKefir(deferred, kefirFromArray(a).filter(even).map(add1).scan(sum, 0).last());
	// }, options)
	// .add('bacon', function(deferred) {
	// 	runners.runBacon(deferred, bacon.fromArray(a).filter(even).map(add1).reduce(0, sum));
	// }, options)
	// .add('highland', function(deferred) {
	// 	runners.runHighland(deferred, highland(a).filter(even).map(add1).reduce(0, sum));
	// }, options)
	// .add('lodash', function() {
	// 	return lodash(a).filter(even).map(add1).reduce(sum, 0);
	// })
	// .add('Array', function() {
	// 	return a.filter(even).map(add1).reduce(sum, 0);
	// });

runners.runSuite(suite);

function add1(x) {
	return x + 1;
}

const combineSamples = (x, a) => x+a.length;

function even(x) {
	return x % 2 === 0;
}

function sum(x, y) {
	return x + y;
}
