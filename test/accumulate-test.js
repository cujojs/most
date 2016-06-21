import { spec, referee } from 'buster';
const { describe, it } = spec;
const { assert } = referee;

import Stream from '../lib/Stream'
import { scan, reduce } from '../lib/combinator/accumulate'
import { throwError } from '../lib/combinator/errors'
import { observe, drain } from '../lib/combinator/observe'

import { fromArray } from '../lib/source/fromArray'
import { empty, of as just } from '../lib/source/core'

import FakeDisposeSource from './helper/FakeDisposeSource'

const sentinel = { value: 'sentinel' };
const other = { value: 'other' };

function endWith (endValue, { source }) {
	return new Stream({
		run: (sink, scheduler) => {
			return  source.run({
				end (t, _) {
					sink.end(t, endValue);
				},
				event (t, x) {
					sink.event(t, x);
				},
				error (t, e) {
					sink.error(t, e);
				}
			}, scheduler);
		}
	});
}

describe('scan', function() {
	it('should yield combined values', function() {
		let i = 0;
		const items = 'abcd';

		const stream = scan( (s, x) => s + x, items[0], fromArray(items.slice(1)));

		return observe(s => {
			++i;
			assert.equals(s, items.slice(0, i));
		}, stream);
	});

	it('should preserve end value', function() {
		const expectedEndValue = {};
		const stream = endWith(expectedEndValue, just({}));

		const s = scan((a, x) => x, {}, stream);

		return drain(s).then(endValue =>
			assert.same(endValue, expectedEndValue));
	});

	it('should dispose', function() {
		const dispose = this.spy();

		const stream = new Stream(new FakeDisposeSource(dispose, just(sentinel).source));
		const s = scan(function(z, x) { return x; }, 0, stream);

		return drain(s).then(() => assert(dispose.calledOnce));
	});
});

describe('reduce', function() {

	describe('when stream is empty', function() {

		it('should reduce to initial', function() {
			return reduce(() => { throw new Error(); }, sentinel, empty())
				.then(result => assert.same(result, sentinel));
		});

	});

	describe('when stream errors', function() {

		it('should reject', function() {
			return reduce(x => x, other, throwError(sentinel))
				.catch(e => assert.same(e, sentinel));
		});

	});

	it('should reduce values', function() {
		return reduce((s, x) => s + x, 'a', fromArray(['b', 'c', 'd']))
			.then(result => assert.same(result, 'abcd'));
	});

});
