var buster = require('buster');
var assert = buster.assert;
var refute = buster.refute;

var Promise = require('../Promise');

var sentinel = { value: 'sentinel' };
var other = { value: 'other' };

function assertp(assert, done, p1, p2) {
	p1.done(function(x) {
		p2.done(function(y) {
			assert(x, y);
			done();
		});
	});
}

function assertEquals(done, p1, p2) {
	assertp(assert.equals, done, p1, p2);
}

function assertSame(done, p1, p2) {
	assertp(assert.same, done, p1, p2);
}

buster.testCase('Promise', {

	'done': {
		'should initiate resolver': function(done) {
			new Promise(function(resolve, reject) {
				assert.isFunction(resolve);
				assert.isFunction(reject);
				done();
			}).done();
		}
	},

	'of': {
		'should create a promise for x': function(done) {
			Promise.of(sentinel).done(function(x) {
				assert.same(x, sentinel);
				done();
			});
		}
	},

	'map': {
		'should satisfy identity': function(done) {
			// u.map(function(a) { return a; })) ~= u
			var u = Promise.of(sentinel);
			assertSame(done, u.map(function(x) { return x; }), u);
		},

		'should satisfy composition': function(done) {
			//u.map(function(x) { return f(g(x)); }) ~= u.map(g).map(f)
			function f(x) { return x + 'f'; }
			function g(x) { return x + 'g'; }

			var u = Promise.of('e');

			assertEquals(done,
				u.map(function(x) { return f(g(x)); }),
				u.map(g).map(f)
			);
		}
	},

	'flatMap': {
		'should satisfy associativity': function(done) {
			// m.flatMap(f).flatMap(g) ~= m.flatMap(function(x) { return f(x).flatMap(g); })
			function f(x) { return Promise.of(x + 'f'); }
			function g(x) { return Promise.of(x + 'g'); }

			var m = Promise.of('m');

			assertEquals(done,
				m.flatMap(function(x) { return f(x).flatMap(g); }),
				m.flatMap(f).flatMap(g)
			);
		}
	},

	'ap': {
		'should satisfy identity': function(done) {
			// P.of(function(a) { return a; }).ap(v) ~= v
			var v = Promise.of(sentinel);
			assertSame(done, Promise.of(function(x) { return x; }).ap(v), v);
		},

		'should satisfy composition': function(done) {
			//P.of(function(f) { return function(g) { return function(x) { return f(g(x))}; }; }).ap(u).ap(v).ap(w) ~= u.ap(v.ap(w))
			var u = Promise.of(function(x) { return 'u' + x; });
			var v = Promise.of(function(x) { return 'v' + x; });
			var w = Promise.of('w');

			assertEquals(done, Promise.of(function(f) {
					return function(g) {
						return function(x) {
							return f(g(x));
						};
					};
				}).ap(u).ap(v).ap(w),
				u.ap(v.ap(w))
			);
		},

		'should satisfy homomorphism': function(done) {
			//P.of(f).ap(P.of(x)) ~= P.of(f(x)) (homomorphism)
			function f(x) { return x + 'f'; }
			var x = 'x';
			assertEquals(done, Promise.of(f).ap(Promise.of(x)), Promise.of(f(x)));
		},

		'should satisfy interchange': function(done) {
			// u.ap(a.of(y)) ~= a.of(function(f) { return f(y); }).ap(u)
			function f(x) { return x + 'f'; }

			var u = Promise.of(f);
			var y = 'y';

			assertEquals(done,
				u.ap(Promise.of(y)),
				Promise.of(function(f) { return f(y); }).ap(u)
			);
		}
	},

	'then': {
		'should forward result when callback is null': function(done) {
			new Promise(function(resolve) {
				resolve(sentinel);
			}).then(null).then(function(x) {
				assert.same(x, sentinel);
			}).done(done, buster.fail);
		},

		'should forward callback result to next callback': function(done) {
			new Promise(function(resolve) {
				resolve(other);
			}).then(function() {
				return sentinel;
			}).then(function(x) {
				assert.same(x, sentinel);
			}).done(done, buster.fail);
		},

		'should forward undefined': function(done) {
			new Promise(function(resolve) {
				resolve(sentinel);
			}).then(function() {
				// intentionally return undefined
			}).then(function(x) {
				refute.defined(x);
			}).done(done, buster.fail);
		},

		'should forward undefined rejection value': function(done) {
			new Promise(function(_, reject) {
				reject(sentinel);
			}).then(buster.fail, function() {
				// intentionally return undefined
			}).then(function(x) {
				refute.defined(x);
			}).done(done, buster.fail);
		},

		'should forward promised callback result value to next callback': function(done) {
			new Promise(function(resolve) {
				resolve(other);
			}).then(function() {
				return Promise.resolve(sentinel);
			}).then(function(x) {
				assert.same(x, sentinel);
			}).done(done, buster.fail);
		},

		'should switch from callbacks to errbacks when callback returns a rejection': function(done) {
			new Promise(function(resolve) {
				resolve(other);
			}).then(function() {
				return Promise.reject(sentinel);
			}).then(null, function(x) {
				assert.same(x, sentinel);
			}).done(done, buster.fail);
		}
	}
});