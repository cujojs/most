/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var Disposable = require('../disposable/Disposable');
var ObservableSource = require('./ObservableSource');
var MulticastSource = require('./MulticastSource');
var AsyncSource = require('./AsyncSource');
var noop = require('../base').noop;

exports.create = create;

function create(run) {
	return new Stream(new MulticastSource(new AsyncSource(new ObservableSource(subscribe))));

	function subscribe(generator) {
		var unsubscribe = run(add, end, error);

		return new Disposable(typeof unsubscribe === 'function' ? unsubscribe : noop);

		function add(x) {
			return generator.next(x);
		}

		function end(x) {
			return generator['return'](x);
		}

		function error(e) {
			return generator['throw'](e);
		}

	}
}
