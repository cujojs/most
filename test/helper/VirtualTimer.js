/** @license MIT License (c) copyright 2010-2015 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/*global setTimeout, clearTimeout*/

module.exports = VirtualTimer;

function VirtualTimer() {
	this._now = this._targetNow = 0;
	this._time = Infinity;
	this._task = void 0;
	this._timer = null;
	this._active = false;
	this._running = false;
	this._key = {};
}

VirtualTimer.prototype.now = function() {
	return this._now;
};

VirtualTimer.prototype.setTimer = function(f, dt) {
	if(this._task !== void 0) {
		throw new Error('VirtualTimer: Only supports one in-flight timer');
	}

	this._task = f;
	this._time = this._now + Math.max(0, dt);
	if(this._active) {
		this._run(f);
	}
	return this._key;
};

VirtualTimer.prototype.clearTimer = function(t) {
	if(t !== this._key) {
		return;
	}

	this._cancel();
	this._time = Infinity;
	this._task = void 0;
};

VirtualTimer.prototype.tick = function(dt) {
	if(dt <= 0) {
		return;
	}

	this._targetNow = this._targetNow + dt;
	this._run();
};

VirtualTimer.prototype._run = function() {
	if(this._running) {
		return;
	}

	this._active = true;
	this._running = true;
	this._step();
};

VirtualTimer.prototype._step = function() {
	this._timer = setTimeout(stepTimer, 0, this);
};

VirtualTimer.prototype._cancel = function() {
	clearTimeout(this._timer);
	this._timer = null;
};

function stepTimer(vt) {
	if (vt._now >= vt._targetNow) {
		vt._now = vt._targetNow;
		vt._time = Infinity;
		vt._running = false;
		return;
	}

	var task = vt._task;
	vt._task = void 0;
	vt._now = vt._time;
	vt._time = Infinity;

	if(typeof task === 'function') {
		task();
	}

	vt._step();
}
