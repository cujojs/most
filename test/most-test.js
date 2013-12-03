require('buster').spec.expose();
var expect = require('buster').expect;

var most = require('../most');

describe('most', function() {

	describe('fromArray', function() {

		it('should not call next for empty array', function(done) {
			var next = this.spy();

			most.fromArray([]).forEach(next, function(e) {
				expect(next).not.toHaveBeenCalled();
				expect(e).not.toBeDefined();
				done();
			});
		});

		it('should iterate over each elements', function(done) {
			var results = [];
			most.fromArray([1, 2]).forEach(function(x) {
				results.push(x);
			}, function(e) {
				expect(results).toEqual([1, 2]);
				done();
			});
		});

		it('should iterate until reach the right number', function(done) {
			var s1 = most.fromArray([1, 2]);
			var count = 0;
			var unsubsribe = s1.forEach(function(x) {
				count++;
				unsubsribe();
			}, function(e) {
				expect(count).toEqual(1);
				done();
			});
		})

	});
});