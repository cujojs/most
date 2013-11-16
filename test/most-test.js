require('buster').spec.expose();
var expect = require('buster').expect;

var most = require('../most');
//var sentinel = { value: 'sentinel' };

describe('most', function() {

	describe('fromArray', function() {

		it('should not call next for empty array', function(done) {
			var next = this.spy();

			most.fromArray([]).each(next, function(e) {
				expect(next).not.toHaveBeenCalled();
				expect(e).not.toBeDefined();
				done();
			});
		});
	});
});