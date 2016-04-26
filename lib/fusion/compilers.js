var prelude = require('@most/prelude');
var Pipe = require('../sink/Pipe');

var compose = prelude.compose;
var reduce = prelude.reduce;

exports.merge = function merge(mergeSource) {
	return new mergeSource.constructor(reduce(function(sources, source) {
		return source instanceof mergeSource.constructor
			? sources.concat(source.sources)
			: sources.concat(source)
	}, [], mergeSource.sources))
}

function appendSources(sources, source) {
	return source.constructor
		? sources.concat(source.sources)
		: sources.concat(source)
}

exports.mapMap = function mapMap(map2) {
	var map1 = map2.source;
	return new map1.constructor(compose(map2.f, map1.f), map1.source);
};

exports.filterFilter = function filterFilter(filter2) {
	var filter1 = filter2.source;
	return new filter1.constructor(and(filter1.p, filter2.p), filter1.source);
};

function and(p, q) {
	return function(x) {
		return p(x) && q(x);
	};
};

exports.filterMap = function filterMap(map) {
	var filter = map.source;
	return new FilterMap(filter.p, map.f, filter.source);
}

function FilterMap(p, f, source) {
	this.p = p;
	this.f = f;
	this.source = source;
}

FilterMap.prototype.run = function(sink, scheduler) {
	return this.source.run(new FilterMapSink(this.p, this.f, sink), scheduler);
};

function FilterMapSink(p, f, sink) {
	this.p = p;
	this.f = f;
	this.sink = sink;
}

FilterMapSink.prototype.event = function(t, x) {
	var f = this.f;
	var p = this.p;
	p(x) && this.sink.event(t, f(x));
};

FilterMapSink.prototype.end = Pipe.prototype.end;
FilterMapSink.prototype.error = Pipe.prototype.error;

exports.sliceSlice = function sliceSlice(slice2) {
	var slice1 = slice2.source;
	var start = slice2.skip;
	var end = slice2.skip + slice2.take;
	var s = start + slice1.skip;
	var e = Math.min(s + end, slice1.skip + slice1.take);
	return new slice2.constructor(s, e, slice1.source);
}

exports.mapSlice = function mapSlice(slice) {
	var map = slice.source;
	return new map.constructor(map.f, new slice.constructor(slice.skip, slice.skip + slice.take, map.source))
}
