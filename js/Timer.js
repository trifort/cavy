(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * タイマークラス
	 * @constructor
	 * @alias cavy.Timer
	 * @example
	 *  var t = cavy.Timer.repeat(function(){},1000);    //1000ms毎に繰り返し
	 *  cavy.Timer.stop(t);    //タイマー停止
	 *  cavy.Timer.repeat(function(){});    //フレーム毎に繰り返し
	 *  cavy.Timer.repeat(function(){},1000,3);    //1000ms毎に３回繰り返し
	 *  cavy.Timer.delay(function(){},0,3);    //フレーム毎に３回繰り返し
	 **/
	var isTick = false;
	var repeats = [];
	var time = 0;
	var timer = null;
	var Timer = {
		/**
		 * フレーム毎に行う処理
		 * @private
		 * @param t {Number} 経過時間（ミリ秒
		 * @return {void}
		 **/
		update: function () {
			var t = Date.now(),
				d = null,
				r = repeats.slice(),
				l = r.length;
			time = t;
			while (l--) {
				d = repeats[l];
				if (d && t - d.time >= d.delay) {
					if (!isNaN(d.count)) {
						--d.count;
						if (d.count === 0) {
							repeats.splice(l, 1);
						}
						d.cacheCount -= d.count;
					}
					d.callback(t - d.timeStamp, t - d.time, d.count);
					d.time = t;
				}
			}
			timer = window.requestAnimationFrame(Timer.update);
		},
		/**
		 * 繰り返し処理
		 * @public
		 * @param callback {Function} 実行する処理
		 * @param delay {Number} インターバル時間
		 * @param count {Int} 繰り返し回数
		 * @return {TimerObject} タイマーオブジェクト
		 **/
		repeat: function (callback, delay, count) {
			var t = new TimerObject(time, callback, delay, count);
			repeats.push(t);
			Timer.play();
			return t;
		},
		/**
		 * 遅延処理
		 * @public
		 * @param callback {Function} 実行する処理
		 * @param delay {Number} 遅延時間
		 * @return {TimerObject} タイマーオブジェクト
		 **/
		delay: function (callback, delay) {
			var t = new TimerObject(time, callback, Math.floor(delay), 1);
			repeats.push(t);
			Timer.play();
			return t;
		},
		play: function () {
			if (!isTick) {
				isTick = true;
				Timer.update();
			}
			return Timer;
		},
		/**
		 * 遅延処理
		 * @public
		 * @param timerObject {TimerObject} タイマーオブジェクト
		 * @return {void}
		 **/
		stop: function (timerObject) {
			var index = repeats.indexOf(timerObject);
			if (index !== -1) {
				repeats.splice(index, 1);
			}
			if (repeats.length === 0) {
				window.cancelAnimationFrame(timer);
				isTick = false;
			}
			return this;
		},
		stopAll: function() {
			if (timer) {
				window.cancelAnimationFrame(timer);
				isTick = false;
			}
			return Timer;
		}
	};
	cavy.Timer = Timer;

	/**
	 * タイマーオブジェクト
	 * @constructor
	 * @alias cavy.TimerObject
	 * @param index {Number} タイマーインデックス
	 * @param time {Number} 現在時間
	 * @param callback {Function} 実行処理
	 * @param delay {Number} ディレイ
	 * @param count {Int} 繰り返し数
	 **/
	var TimerObject = function (time, callback, delay, count) {
		this.time = time || 0;
		this.timeStamp = time || Date.now();
		this.callback = callback || function () {
		};
		this.delay = delay || 0;
		this.count = count || NaN;
		this.cacheCount = count || 0;
	};
	TimerObject.prototype = {
		/**
		 * タイマー停止
		 * @public
		 * @return {void}
		 **/
		stop: function () {
			Timer.stop(this);
		},
		play: function() {
			repeats.push(this);
		}
	};
	cavy.TimerObject = TimerObject;
})(window);