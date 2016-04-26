require('buster').spec.expose();
var expect = require('buster').expect;
var $$observable = require('symbol-observable');

var most = require('../most.js')

var sentinel = { value: 'sentinel' };

describe('Stream', function() {

	it('should implement Symbol.observable', function (done) {
    var isDisposed = false;
    var results = [];

		var stream = most.create(function (add, end, error) {
      add(1);
      add(2);
      add(3);
      end('done');
      return function () {
        isDisposed = true;
      }
    });


    var observable = stream[$$observable]();

    expect(typeof observable.subscribe).toBe('function');

    var subscription = observable.subscribe({
      next: function (value) {
        results.push(value);
      },
      error: function (err) {
        throw err;
      },
      complete: function (value) {
        expect(results).toEqual([1, 2, 3]);
        expect(value).toEqual('done');
        expect(isDisposed).toBe(true);
        done();
      }
    });

    expect(typeof subscription.unsubscribe).toBe('function');
	});

  it('should return an observable that can be cancelled via unsubscription', function () {
    var results = [];

		var stream = most.create(function (add, end, error) {
      var i = 0;
      var id = setInterval(function () {
        add(i++);
        if (i === 3) {
          end('done');
        }
      });

      return function () {
        clearInterval(id);
        expect(results).toEqual([0]);
        done();
      }
    });


    var observable = stream[$$observable]();

    expect(typeof observable.subscribe).toBe('function');

    var subscription = observable.subscribe({
      next: function (value) {
        results.push(value);
        subscription.unsubscribe();
      },
      error: function (err) {
        throw err;
      },
      complete: function (value) {
        throw new Error('should not complete');
      }
    });
  });
});
