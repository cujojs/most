/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Disposable = require('./Disposable');
var SettableDisposable = require('./SettableDisposable');
var base = require('../base');

var map = base.map;
var identity = base.identity;

exports.newDisposable = newDisposable;
exports.once = once;
exports.empty = empty;
exports.all = all;
exports.settable = settable;
exports.promised = promised;

/**
 * Create a new Disposable which will dispose its underlying resource
 * at most once.
 * @param {function} dispose function
 * @param {*?} data any data to be passed to disposer function
 * @return {Disposable}
 */
function newDisposable(dispose, data) {
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
	return newDisposable(disposeAll, disposables);
}

function disposeAll(disposables) {
	return Promise.all(map(disposeOne, disposables));
}

function disposeOne(disposable) {
	return disposable.dispose();
}

/**
 * Create a disposable from a promise for another disposable
 * @param {Promise<Disposable>} disposablePromise
 * @return {Disposable}
 */
function promised(disposablePromise) {
	return newDisposable(disposePromise, disposablePromise);
}

function disposePromise(disposablePromise) {
	return disposablePromise.then(disposeOne);
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
		memoized.value = memoized.disposable.dispose();
		memoized.disposable = void 0;
	}

	return memoized.value;
}

function memoized(disposable) {
	return { disposed: false, disposable: disposable, value: void 0 };
}
