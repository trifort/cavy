/**
 * @fileOverview Sound
 * @author yuu@creatorish
 * @version 0.0.1
 **/
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	var Sound = function (pool) {
		this.pool = pool;
		this.track = {};
		this.cache = {};
		this.latest;
		var self = this;
		this.preloadHandler = function (e) {
			self.preload();
		};
		this.initialize();
	};
	Sound.prototype = Object.create(cavy.EventDispatcher.prototype);
	Sound.prototype.constructor = Sound;
	Sound.prototype.initialize = function () {
		for (var key in this.pool) {
			this.track[key] = new Audio(this.pool[key]);
			this.track[key].preload = true;
			this.track[key].load();
			this.cache[key] = this.track[key].cloneNode(true);
		}
	};
	Sound.prototype.load = function (name) {
		if (this.track[name]) {
			this.track[name].load();
		}
	};
	Sound.prototype.play = function (name) {
		if (this.track[name]) {
			if (this.cache[name]) {
				//this.cache[name].pause();
				if (this.latest && this.latest !== this.cache[name]) {
					//this.latest.pause();
				}
				if (this.cache[name].src === this.track[name].src) {
					//this.cache.currentTime = 0;
				}
				this.cache[name].play();
			} else {
				this.track[name].play();
			}
			this.cache[name] = this.track[name].cloneNode(true);
			this.latest = this.cache[name];
		}
	};
	Sound.prototype.stop = function (name) {
		if (this.track[name]) {
			this.track[name].pause();
			this.track[name] = this.track[name].cloneNode(true);
		}
	};
	Sound.prototype.pause = function (name) {
		if (this.track[name]) {
			this.track[name].pause();
		}
	};
	cavy.Sound = Sound;
})(window);
