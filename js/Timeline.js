(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * タイムラインオブジェクトクラス
	 * @constructor
	 * @alias cavy.Timeline
	 * @augments cavy.EventDispatcher
	 * @param frameCount {Int} 必要なフレーム数（先に定義しておくとパフォーマンスUP）
	 * @example
	 *  var t = new cavy.Timeline(1000);
	 *  t.addLabel(0,"start",function(){});
	 *  t.addLabel(1000,"end",function(){});
	 *  t.add("start", function() {});
	 *  t.add(1000,function() {});
	 *  t.play();
	 *  t.gotoAndStop("end");
	 *  t.gotoAndPlay("start");
	 *  t.stop();
	 **/
	var Timeline = function (frameCount) {
		if (frameCount) {
			this.queue = new Array(frameCount);
		} else {
			this.queue = [];
		}
		/**
		 * ラベル
		 * @type {}
		 */
		this.labels = {};
		/**
		 * 現在フレーム数
		 * @type {number}
		 */
		this.frame = 0;
		/**
		 * タイマー
		 * @private
		 * @type {TimerId}
		 */
		this.timer = null;
		/**
		 * 現在時間
		 * @type {number}
		 */
		this.time = 0;
		/**
		 * 経過時間
		 * @type {number}
		 */
		this.passedTime = 0;
		var self = this;
		this._enterframeHandler = function () {
			self._tick();
			self.frame++;
		};
		cavy.EventDispatcher.apply(this);
	};
	var p = p = Object.create(cavy.EventDispatcher.prototype);
	p.constructor = Timeline;

	/**
	 * ミリ秒
	 * @contant
	 * @default 1000
	 * @type {number}
	 */
	p.SECOND = 1000;
	/**
	 * フレームにイベントを追加
	 * @public
	 * @param frame {Number|String} フレーム数またはラベル名
	 * @param callback {Function} 指定フレーム時に実行する処理
	 * @return {void}
	 **/
	p.add = function (frame, callback) {
		if (typeof frame === "string") {
			var f = this.labels[frame];
			if (isNaN(f)) {
				window.console.error("Not found label [" + frame + "]");
				return;
			}
			frame = f;
		}
		frame = Math.round(frame / (this.SECOND / cavy.frameRate));
		if (typeof this.queue[frame] === "object") {
			this.queue[frame].push(callback);
		} else {
			this.queue[frame] = [callback];
		}
		return this;
	};
	/**
	 * ラベルを追加
	 * @public
	 * @param frame {Number} フレーム数
	 * @param name {String} ラベル名
	 * @param callback {Function} 指定フレーム時に実行する処理
	 * @return {void}
	 **/
	p.addLabel = function (frame, name, callback) {
		this.labels[name] = frame;
		if (callback) {
			this.add(frame, callback);
		}
	};
	/**
	 * ラベルを削除
	 * @public
	 * @param name {String} ラベル名
	 * @return {void}
	 **/
	p.removeLabel = function (name) {
		delete this.labels[name];
	};
	/**
	 * フレームイベントを削除
	 * @public
	 * @param frame {Number} フレーム数
	 * @return {void}
	 **/
	p.remove = function (frame, callback) {
		var q = this.queue[frame];
		if (q) {
			var i = q.indexOf(callback);
			if (i !== -1) {
				q.splice(i, 1);
			}
		}
		return this;
	};
	/**
	 * タイムライン開始
	 * @public
	 * @return {void}
	 **/
	p.play = function () {
		this.stop();
		this.time = Date.now();
		this.timer = cavy.Timer.repeat(this._enterframeHandler);
		return this;
	};
	/**
	 * タイムライン停止
	 * @public
	 * @return {void}
	 **/
	p.stop = function () {
		cavy.Timer.stop(this.timer);
		return this;
	};
	/**
	 * 指定フレームへ移動しタイムラインを開始
	 * @public
	 * @param frame {Number|String} フレーム数またはラベル名
	 * @return {void}
	 **/
	p.goToAndPlay = function (frame) {
		if (typeof frame === "string") {
			var f = this.labels[frame];
			if (isNaN(f)) {
				window.console.error("Not found label [" + frame + "]");
				return;
			}
			frame = f;
		}
		this.frame = Math.round(frame / (this.SECOND / cavy.frameRate));
		this.passedTime = Math.floor(this.frame * (this.SECOND / cavy.frameRate));
		this._tick();
		this.play();
	};
	/**
	 * 指定フレームへ移動しタイムラインを停止
	 * @public
	 * @param frame {Number|String} フレーム数またはラベル名
	 * @return {void}
	 **/
	p.goToAndStop = function (frame) {
		if (typeof frame === "string") {
			var f = this.labels[frame];
			if (isNaN(f)) {
				window.console.error("Not found label [" + frame + "]");
				return;
			}
			frame = f;
		}
		this.frame = Math.round(frame / (Timeline.SECOND / cavy.Tween.frameRate));
		this.passedTime = Math.floor(this.frame * (this.SECOND / cavy.frameRate));
		this._tick();
		this.stop();
	};
	/**
	 * タイムラインをリセット
	 * @public
	 * @return {void}
	 **/
	p.reset = function () {
		this.frame = 0;
		return this;
	};
	/**
	 * フレーム毎の処理
	 * @private
	 * @return {void}
	 **/
	p._tick = function () {
		var t = Date.now(),
			lt = t - this.time;
		this.passedTime += lt;
		this.time = t;
		var frame = Math.floor(this.passedTime / (1000 / cavy.frameRate));
		if (frame - this.frame > cavy.maxSkip) {
			frame = this.frame + cavy.maxSkip;
		}
		var range = [this.frame, frame];
		this.frame = frame;
		for (var i = range[0]; i <= range[1]; i++) {
			if (this.frame !== frame) {
				break;
			}
			var f = this.queue[i];
			if (f && f.length !== 0) {
				var l = f.length;
				while (l--) {
					f[l].apply(this, [this.frame]);
				}
			}
		}
		if (this.frame > this.queue.length) {
			this.stop();
			this.dispatchEvent("complete");
			return;
		}

	};
	cavy.Timeline = Timeline;
})(window);
