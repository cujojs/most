var Disposable = require('../../lib/disposable/Disposable');
var CompoundDisposable = require('../../lib/disposable/CompoundDisposable');

module.exports = FakeDisposeSource;

function FakeDisposeSource(dispose, source) {
	this.source = source;
	this.disposable = new Disposable(dispose);
}

FakeDisposeSource.prototype.run = function(sink) {
	return new CompoundDisposable([this.source.run(sink), this.disposable]);
};