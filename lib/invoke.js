/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

module.exports = invoke;

function invoke(f, args) {
	/*jshint maxcomplexity:7*/
	switch(args.length) {
		case 0: return f();
		case 1: return f(args[0]);
		case 2: return f(args[0], args[1]);
		case 3: return f(args[0], args[1], args[2]);
		case 4: return f(args[0], args[1], args[2], args[3]);
		case 5: return f(args[0], args[1], args[2], args[3], args[4]);
		default:
			return f.apply(void 0, args);
	}
}