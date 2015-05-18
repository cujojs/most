/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Promise = require('./Promise');

module.exports = defer;

function defer(task) {
	return Promise.resolve(task).then(runTask);
}

function runTask(task) {
	try {
		return task.run();
	} catch(e) {
		return task.error(e);
	}
}