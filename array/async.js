(function(define) {
define(function(require) {

	var async, slice;
	async  = require('../async');
	slice = Array.prototype.slice;
	
	return function asyncEvery(array, next, end) {
		function iterate(a) {
			if(a.length > 0) {
				async(function() {
					try {
						(next(a[0]) === false) ? end() : iterate(slice.call(a, 1)) ;
					} catch (e) {
						end(e);
					}
				});
			} else {
				end();
			}
		}
		iterate(array);
	}
});
})(
        typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
        // Boilerplate for AMD and Node
);
