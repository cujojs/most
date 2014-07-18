/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

exports.findIndex = findIndex;

/**
 * Find the index of x in the sortedArray using a binary search
 * @param {function(a, b):Number} compare comparator to return:
 *  0 when a === b
 *  negative when a < b
 *  positive when a > b
 * @param {*} x item to find
 * @param {Array} sortedArray already-sorted array in which to find x
 * @returns {Number} index of x if found OR index at which x should be
 *  inserted to preserve sort order
 */
function findIndex(compare, x, sortedArray) {
	var lo = 0;
	var hi = sortedArray.length;
	var mid, cmp;

	while (lo < hi) {
		mid = Math.floor((lo + hi) / 2);
		cmp = compare(x, sortedArray[mid]);

		if (cmp === 0) {
			return mid;
		} else if (cmp < 0) {
			hi = mid;
		} else {
			lo = mid + 1;
		}
	}
	return hi;
}