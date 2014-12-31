var Disposable = require('../../lib/disposable/Disposable');
var CompoundDisposable = require('../../lib/disposable/CompoundDisposable');

module.exports = FakeDisposeSource;

FakeDisposeSource.from = function(dispose, stream) {
	return new FakeDisposeSource(dispose, stream.source);
};

function FakeDisposeSource(dispose, source) {
	this.source = source;
	this.disposable = new Disposable(dispose);
}

FakeDisposeSource.prototype.run = function(sink, scheduler) {
	return new CompoundDisposable([this.source.run(sink, scheduler), this.disposable]);
};