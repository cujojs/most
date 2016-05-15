import { spec, referee } from 'buster';
const { describe, it } = spec
const { fail, assert } = referee;

import { continueWith } from '../../lib/combinator/continueWith';
import { drain } from '../../lib/combinator/observe';
import { of as just } from '../../lib/source/core';

describe('continueWith', () => {
	it('when f throws, should propagate error', () => {
		const error = new Error()
		const s = continueWith(x => { throw error; }, just(0));
		return drain(s).then(fail, e => assert.same(error, e));
	});
});
