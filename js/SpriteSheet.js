(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * canvasにスプライト画像を配置するオブジェクトクラス
	 * @constructor
	 * @alias cavy.SpriteSheet
	 * @augments cavy.Sprite
	 * @param obj {Object} widthとheightを持つオブジェクト
	 * @param pattern {Object} スプライトアニメーションパターン
	 * @param param {Object} 初期パラメータ
	 * @example
	 *    var s = new SpriteSheet(img, {
	 *		walk: [0,0,3,2],	//(0,0)から3フレームを１回繰り返しアニメーションさせます
	 *		sample: [オフセットx,オフセットy,フレーム数,繰り返し回数]
	 *	});
	 **/
	var SpriteSheet = function (obj, pattern, param) {
		/**
		 * アニメーションパターン配列
		 * @type {*}
		 */
		this.pattern = pattern || [];
		/**
		 * アニメーションパターン名
		 * @type {string}
		 */
		this.sheet = null;
		/**
		 * 現在のフレーム
		 * @type {number}
		 */
		this.frame = 0;
		/**
		 * 現在の処理数
		 * @type {number}
		 */
		this.count = 0;
		/**
		 * アニメーション間隔
		 * @type {number}
		 */
		this.interval = 0;
		/**
		 * アニメーション方向
		 * @type {string}
		 * @default "horizontal"
		 */
		this.direction = "horizontal";
		/**
		 * タイマー
		 * @type {TimerID}
		 * @private
		 */
		this.timer = null;
		/**
		 * 処理行数
		 * @private
		 * @type {number}
		 */
		this.line = 0;
		var self = this;
		this._enterframeHandler = function () {
			self.enterframe();
		};
		cavy.Sprite.call(this,obj,param);
	};
	var p = SpriteSheet.prototype = Object.create(cavy.Sprite.prototype);
	p.constructor = SpriteSheet;
	/**
	 * スプライトアニメーション実行
	 * @public
	 * @return {void}
	 **/
	p.play = function () {
		this.timer = cavy.Timer.repeat(this._enterframeHandler, this.interval);
	};
	/**
	 * スプライトアニメーション停止
	 * @public
	 * @return {void}
	 **/
	p.stop = function () {
		cavy.Timer.stop(this.timer);
	};
	/**
	 * スプライトアニメーション フレーム毎の処理
	 * @private
	 * @return {void}
	 **/
	p.enterframe = function () {
		var pat = this.pattern[this.sheet];
		if (!pat) {
			return;
		}

		var x = pat[0], y = pat[1], l = pat[2], limit = pat[3];
		if (this.frame > l) {
			if (limit) {
				++this.count;
				if (this.count === limit) {
					this.stop();
					this.dispatchEvent("complete");
				}
			}
			this.line = 0;
			this.frame = 0;
		}

		var f = 0;
		if (this.direction === "horizontal") {
			var maxOffsetX = Math.floor(this.source.width / this.width);
			f = (this.line === 0) ? this.frame : this.frame - (this.line * maxOffsetX);
			if (f === maxOffsetX) {
				this.offsetX = 0;
				this.line += 1;
			} else {
				this.offsetX = f;
			}
			this.offsetY = this.line + y;
		} else {
			var maxOffsetY = Math.floor(this.source.height / this.height);
			f = (this.line === 0) ? this.frame : this.frame - (this.line * maxOffsetY);
			if (f === maxOffsetY) {
				this.offsetY = 0;
				this.line += 1;
			} else {
				this.offsetY = f;
			}
			this.offsetX = this.line + x;
		}
		this.frame++;
	};
	cavy.SpriteSheet = SpriteSheet;
})(window);