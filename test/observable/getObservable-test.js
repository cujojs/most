require('buster').spec.expose();
var assert = require('buster').referee.assert;

var symbolObservable = require('symbol-observable');
var getObservable = require('../../lib/observable/getObservable');

describe('getObservable', function() {
	it('should return null for non-object', function() {
		assert.same(null, getObservable(1));
		assert.same(null, getObservable(undefined));
		assert.same(null, getObservable(''));
		assert.same(null, getObservable(true));
	});

	it('should return null for non-observable object', function() {
		assert.same(null, getObservable({}));
		assert.same(null, getObservable(null));
	});

	it('should throw TypeError for invalid observable', function() {
		var outer = {};
		outer[symbolObservable] = function() {
			return null;
		}

		assert.exception(function() {
			return getObservable(outer);
		}, function(e) { return e instanceof TypeError });
	});

	it('should throw if calling Symbol.observable throws', function() {
		var outer = {};
		var error = new Error();
		outer[symbolObservable] = function() {
			throw error;
		}

		assert.exception(function() {
			return getObservable(outer);
		}, function(e) { return e === error });
	});

	it('should return observable if valid', function() {
		var outer = {};
		var inner = {};
		outer[symbolObservable] = function() {
			return inner
		}

		assert.same(inner, getObservable(outer));
	});

});
