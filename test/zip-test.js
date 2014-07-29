require('buster').spec.expose();
var expect = require('buster').expect;

var zip = require('../lib/combinators/zip');
var Stream = require('../lib/Stream');

describe('zipWith', function() {
	it('should invoke f for each tuple', function() {
		var spy = this.spy();
		var a = [1,2,3];
		var b = [4,5,6];
		return zip.zipWith(spy, Stream.from(a), Stream.from(b))
			.reduce(function(i) {
				expect(spy).toHaveBeenCalledWith(a[i], b[i]);
				return i + 1;
			}, 0);
	});
});

describe('zip', function() {
	it('should yield zipped tuples', function() {
		var a = [1,2,3];
		var b = [4,5,6];
		var i = 0;
		return zip.zip(Stream.from(a), Stream.from(b))
			.reduce(function(i, zipped) {
				expect(zipped).toEqual([a[i], b[i]]);
				return i + 1;
			}, 0);
	});
});

describe('zipArrayWith', function() {
	it('should invoke f for each tuple', function() {
		var spy = this.spy();
		var a = [1,2,3];
		var b = [4,5,6];
		return zip.zipArrayWith(spy, [Stream.from(a), Stream.from(b)])
			.reduce(function(i) {
				expect(spy).toHaveBeenCalledWith(a[i], b[i]);
				return i + 1;
			}, 0);
	});

	it('should end when shortest stream ends', function() {
		var spy = this.spy();
		var a = [1,2];
		var b = [4,5,6];
		return zip.zipArrayWith(spy, [Stream.from(a), Stream.from(b)])
			.reduce(function(count) {
				return count + 1;
			}, 0).then(function(count) {
				expect(count).toBe(a.length);
			});

	});
});