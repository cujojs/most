/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

module.exports = Observer;

function Observer(event, end, error) {
	this._event = event;
	this._end = end;
	this._error = error;
	this.active = true;
}

Observer.prototype.event = function(t, x) {
	if (!this.active) {
		return;
	}
	this._event(x);
};

Observer.prototype.end = function(t, x) {
	if (!this.active) {
		return;
	}
	this.active = false;
	this._end(x);
};

Observer.prototype.error = function(t, e) {
	this.active = false;
	this._error(e);
};

