var kefir = require('kefir');
kefir.DEPRECATION_WARNINGS = false;

exports.runSuite       = runSuite;

exports.runMost        = runMost;
exports.runRx          = runRx;
exports.runRx5         = runRx5;
exports.runKefir       = runKefir;
exports.kefirFromArray = kefirFromArray;
exports.runBacon       = runBacon;
exports.runHighland    = runHighland;
exports.runXstream     = runXstream;

exports.getIntArg      = getIntArg;
exports.getIntArg2     = getIntArg2;
exports.logResults     = logResults;

function noop() {}

function _getIntArg(defaultValue, index) {
  var n = parseInt(process.argv[index]);
  return isNaN(n) ? defaultValue : n;
}

function getIntArg(defaultValue) {
  return _getIntArg(defaultValue, process.argv.length - 1);
}

function getIntArg2(default1, default2) {
  var m = _getIntArg(default1, process.argv.length - 2);
  var n = _getIntArg(default2, process.argv.length - 1);
  return [m, n];
}

function logResults(e) {
  var t = e.target;

  if(t.failure) {
    console.error(padl(10, t.name) + 'FAILED: ' + e.target.failure);
  } else {
    var result = padl(18, t.name)
      + padr(13, t.hz.toFixed(2) + ' op/s')
      + ' \xb1' + padr(7, t.stats.rme.toFixed(2) + '%')
      + padr(15, ' (' + t.stats.sample.length + ' samples)');

    console.log(result);
  }
}

function logStart() {
  console.log(this.name);
  console.log('-------------------------------------------------------');
}

function logComplete() {
  console.log('-------------------------------------------------------');
}

function runSuite(suite) {
  return suite
    .on('start', logStart)
    .on('cycle', logResults)
    .on('complete', logComplete)
    .run();
}

function runMost(deferred, mostPromise) {
  mostPromise.then(function() {
    deferred.resolve();
  }, function(e) {
    deferred.benchmark.emit({ type: 'error', error: e });
    deferred.resolve(e);
  });
}

function runRx(deferred, rxStream) {
  rxStream.subscribe({
    onNext: noop,
    onCompleted: function() {
      deferred.resolve();
    },
    onError: function(e) {
      deferred.benchmark.emit({ type: 'error', error: e });
      deferred.resolve(e);
    }
  });
}

function runXstream(deferred, xsStream) {
  xsStream.addListener({
    next: noop,
    complete: function() {
      deferred.resolve();
    },
    error: function(e) {
      deferred.benchmark.emit({ type: 'error', error: e });
      deferred.resolve(e);
    }
  });
}

function runRx5(deferred, rxStream) {
  rxStream.subscribe({
    next: noop,
    complete: function() {
      deferred.resolve();
    },
    error: function(e) {
      deferred.benchmark.emit({ type: 'error', error: e });
      deferred.resolve(e);
    }
  });
}

function runKefir(deferred, kefirStream) {
  kefirStream.onValue(noop);
  kefirStream.onEnd(function() {
    deferred.resolve();
  });
}

function kefirFromArray(array) {
  return kefir.stream(function(emitter) {
    for(var i=0; i<array.length; ++i) {
      emitter.emit(array[i]);
    }
    emitter.end();
  });
}

function runBacon(deferred, baconStream) {
  try {
    baconStream.onValue(noop);
    baconStream.onEnd(function() {
      deferred.resolve();
    });
    baconStream.onError(function(e) {
      deferred.benchmark.emit({ type: 'error', error: e });
      deferred.resolve(e);
    });
  } catch(e) {
    deferred.benchmark.emit({ type: 'error', error: e });
    deferred.resolve(e);
  }
}

// Using pull() seems to give the fastest results for highland,
// but will only work for test runs that reduce a stream to a
// single value.
function runHighland(deferred, highlandStream) {
  highlandStream.pull(function(err, z) {
    if(err) {
      deferred.reject(err);
      return;
    }

    deferred.resolve(z);
  });
}

function padl(n, s) {
  while(s.length < n) {
    s += ' ';
  }
  return s;
}

function padr(n, s) {
  while (s.length < n) {
    s = ' ' + s;
  }
  return s;
}
