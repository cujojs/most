import { spec, referee } from 'buster';
const { describe, it } = spec;
const { assert } = referee;

import symbolObservable from 'symbol-observable'
import getObservable from '../../lib/observable/getObservable';

describe('getObservable', function() {
	it('should return null for non-object', () => {
		assert.same(null, getObservable(0));
		assert.same(null, getObservable(1));
		assert.same(null, getObservable(undefined));
		assert.same(null, getObservable(''));
		assert.same(null, getObservable('string'));
		assert.same(null, getObservable(true));
		assert.same(null, getObservable(false));
	});

	it('should return null for non-observable object', () => {
		assert.same(null, getObservable({}));
		assert.same(null, getObservable(null));
		assert.same(null, getObservable(function() {}));
		assert.same(null, getObservable([]));
	});

	it('should throw TypeError for invalid observable', () => {
		const outer = {
			[symbolObservable]: () => null
		};

		assert.exception(() => getObservable(outer),
			e => e instanceof TypeError);
	});

	it('should throw if calling Symbol.observable throws', () => {
		const error = new Error();
		const outer = {
			[symbolObservable] () {
				throw error;
			}
		};

		assert.exception(() => getObservable(outer), e => e === error);
	});

	it('should return observable if valid', () => {
		const inner = { subscribe: function() {} };
		const outer = {
			[symbolObservable]: () => inner
		};

		assert.same(inner, getObservable(outer));
	});

});
