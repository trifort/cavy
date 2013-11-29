/**
 * @fileOverview cavy.tapプラグイン
 * @version 0.0.2
 **/
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	cavy.EventDispatcher.LongTapPlaceHolder = 300;
	cavy.EventDispatcher._LongTapTarget = [];
	cavy.EventDispatcher._clearAllTimer = function() {
		var c = cavy.EventDispatcher._LongTapTarget.slice();
		var l = c.length;
		while(l--) {
			window.clearTimeout(c[l].__tap__.timer);
		}
	};
	document.body.addEventListener("touchmove", cavy.EventDispatcher._clearAllTimer, true);
	cavy.EventDispatcher.prototype.on = function(type, listener) {
		var typeStore = this.__store__[type] || [];
		if (type === "tap" || type === "longtap") {
			this.__tap__ = this.__tap__ || {
				isTouch: false,
				time: 0
			};
			var ts;
			var tm;
			var te;
			if (type === "tap") {
				ts = function(e) {
					if (e.touches.length === 1) {
						this.__tap__.isTouch = true;
						this.__tap__.time = Date.now();
						e.preventDefault();
					}
				};
				tm = function(e) {
					this.__tap__.isTouch = false;
				};
				te = function(e) {
					if (this.__tap__.isTouch) {
						var t = Date.now() - this.__tap__.time;
						if (t < cavy.EventDispatcher.LongTapPlaceHolder) {
							if (this.hasEvent("tap")) {
								this.trigger("tap",e);
							}
							cavy.EventDispatcher._clearAllTimer();
						}
						e.preventDefault();
					}
				}
			} else {
				ts = function(e) {
					if (e.touches.length === 1) {
						e.preventDefault();
						var self = this;
						window.clearTimeout(this.__tap__.timer);
						this.__tap__.timer = window.setTimeout(function() {
							if (self.hasEvent("longtap")) {
								self.trigger("longtap",e);
							}
						}, cavy.EventDispatcher.LongTapPlaceHolder);
					}
				};
				tm = function(e) {
					window.clearTimeout(this.__tap__.timer);
				};
				te = function(e) {
					window.clearTimeout(this.__tap__.timer);
				}
				cavy.EventDispatcher._LongTapTarget.push(this);
			}

			this.on("touchstart",ts);
			this.on("touchmove",tm);
			this.on("touchend",te);
			typeStore.push([ts,tm,te,listener]);
		} else {
			typeStore.push(listener);
		}
		this.__store__[type] = typeStore;
		
		return this;
	};
	cavy.EventDispatcher.prototype.off = function(type, listener) {
		var typeStore;
		if (!type) {
			this.__store__ = [];
		} else if (typeof listener === "function") {
			typeStore = this.__store__[type];
			if (typeStore) {
				if (type === "tap" || type === "longtap") {
					typeStore = typeStore.slice();
					for (var i = 0, len = typeStore.length; i < len; i++) {
						var t = typeStore[i];
						if (t[3] !== listener) {continue;}
						this.off("touchstart",t[0]);
						this.off("touchmove",t[1]);
						this.off("touchend",t[2]);
						var index = typeStore.indexOf(t);
						if (index !== -1) {
							typeStore.splice(index, 1);
						}
					}
					this.__store__[type] = typeStore;
				} else {
					var index = typeStore.indexOf(listener);
					if (index !== -1) {
						typeStore.splice(index, 1);
						this.__store__[type] = typeStore;
					}
				}
			}
		} else {
			typeStore = this.__store__[type];
			if ((type === "tap" || type === "longtap") && typeStore) {
				var t = typeStore[i];
				for (var i = 0, len = typeStore.length; i < len; i++) {
					var t = typeStore[i];
					this.off("touchstart",t[0]);
					this.off("touchmove",t[1]);
					this.off("touchend",t[2]);
					var index = typeStore.indexOf(t);
					if (index !== -1) {
						typeStore.splice(index, 1);
					}
				}
			}
			delete this.__store__[type];
		}
		return this;
	};
	cavy.EventDispatcher.prototype.trigger = function (type, e, thisObj) {
		var typeStore = this.__store__[type] || null;
		if (typeStore) {
			thisObj = thisObj || this;
			var args = Array.prototype.slice.apply(arguments, [1]);
			var t = typeStore.slice();
			if (type === "tap" || type === "longtap") {
				for (var i = 0, len = t.length; i < len; i++) {
					t[i][3].apply(thisObj, args);
				}
			} else {
				for (var i = 0, len = t.length; i < len; i++) {
					t[i].apply(thisObj, args);
				}
			}
			t = null;
		}
		return this;
	};
})(window);