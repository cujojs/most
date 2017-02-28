/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

export default function Stream (source) {
  this.source = source
}

Stream.prototype.run = function (sink, source) {
  return this.source.run(sink, source)
}
