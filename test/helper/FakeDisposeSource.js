var dispose = require('../../lib/disposable/dispose');
var newDisposable = dispose.newDisposable;

module.exports = FakeDisposeSource;

FakeDisposeSource.from = function(dispose, stream) {
	return new FakeDisposeSource(dispose, stream.source);
};

function FakeDisposeSource(dispose, source) {
	this.source = source;
	this.disposable = newDisposable(dispose);
}

FakeDisposeSource.prototype.run = function(sink, scheduler) {
	return dispose.all([this.source.run(sink, scheduler), this.disposable]);
};
