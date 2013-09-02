/**
 * @fileOverview Graphic
 * @version 0.0.1
 **/
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * canvasに画像を配置するオブジェクトクラス
	 * @constructor
	 * @alias cavy.Graphic
	 * @augments cavy.InteractiveObject
	 * @param {Number} width 横幅
	 * @param {Number} height 高さ
	 * @param {Object} param 初期パラメータ
	 **/
	var Graphic = function (obj, param) {
		/**
		 * 背景色
		 * @type {string}
		 * @default "transparent"
		 */
		this.backgroundColor = "transparent";
		/**
		 * 線の太さ
		 * @type {string}
		 * @default null
		 */
		this.borderWidth = null;
		/**
		 * ボーダーカラー
		 * @type {string}
		 * @default "transparent"
		 */
		this.borderColor = "transparent";
		/**
		 * 背景イメージ
		 * @type {HTMLImageElement}
		 * @default null
		 */
		this.backgroundImage = null;
		/**
		 * 背景繰り返し
		 * @type {string}
		 * @default null
		 */
		this.backgroundRepeat = null;
		/**
		 * マスクの位置タイプ
		 * @type {string}
		 * @default "relative"
		 */
		this.maskType = "relative";

		/**
		 * 処理キュー配列
		 * @type {Array}
		 */
		this.queue = [];
		cavy.InteractiveObject.apply(this, [obj, param]);
	};
	Graphic.prototype = Object.create(cavy.InteractiveObject.prototype);
	/**
	 * 角度からラジアンに変換する係数
	 * @private
	 * @type {number}
	 */
	Graphic.DEG_TO_RAD = Math.PI / 180;
	Graphic.prototype.constructor = Graphic;
	/**
	 * パスを書き出す
	 * @private
	 * @param ctx
	 * @param p
	 * @param m
	 */
	Graphic.prototype.drawPath = function (ctx, p, m) {
		if (this.cache) {
			if (this.imageCache && this.imageCache.src !== "data:,") {
				ctx.drawImage(this.imageCache, 0, 0, this.imageCache.width, this.imageCache.height);
			} else {
				ctx.drawImage(this.cache, 0, 0, this.cache.width, this.cache.height);
			}
			return;
		}
		ctx.beginPath();
		if (p && m) {
			if (this.backgroundImage) {
				var pattern = ctx.createPattern(this.backgroundImage, this.backgroundRepeat);
				ctx.fillStyle = pattern;
			} else if (typeof this.backgroundColor === "object") {
				ctx.fillStyle = this.backgroundColor.draw(ctx, p, m);
			} else {
				ctx.fillStyle = this.backgroundColor;
			}
		}
		var i = 0, l = this.queue.length;
		for (; i < l; i++) {
			var q = this.queue[i];
			ctx[q[0]].apply(ctx, q[1]);
		}
		ctx.lineWidth = this.borderWidth;
		ctx.strokeStyle = this.borderColor;
		ctx.stroke();
		ctx.fill();
		ctx.closePath();
	};

	/**
	 * 矩形を描く
	 * @public
	 * @param x {Number} x
	 * @param y {Number} y
	 * @param w {Number} width
	 * @param h {Number} height
	 */
	Graphic.prototype.rect = function (x, y, w, h) {
		this.queue.push(["rect", [x, y, w, h]]);
	};
	/**
	 * 塗りつぶされた矩形を描く
	 * @public
	 * @param x {Number} x
	 * @param y {Number} y
	 * @param w {Number} width
	 * @param h {Number} height
	 */
	Graphic.prototype.fillRect = function (x, y, w, h) {
		this.queue.push(["fillRect", [x, y, w, h]]);
	};
	/**
	 * 矩形の輪郭を描く
	 * @public
	 * @param x {Number} x
	 * @param y {Number} y
	 * @param w {Number} width
	 * @param h {Number} height
	 */
	Graphic.prototype.strokeRect = function (x, y, w, h) {
		this.queue.push(["strokeRect", [x, y, w, h]]);
	};
	/**
	 * 描画をクリアする
	 * @public
	 */
	Graphic.prototype.clear = function () {
		this.queue = [];
	};
	/**
	 * 矩形クリア
	 * @public
	 * @param x {Number} x
	 * @param y {Number} y
	 * @param w {Number} width
	 * @param h {Number} height
	 */
	Graphic.prototype.clearRect = function (x, y, w, h) {
		this.queue.push(["clearRect", [x, y, w, h]]);
	};
	/**
	 * 直線を引く
	 * @public
	 * @param x {Number} x
	 * @param y {Number} y
	 */
	Graphic.prototype.lineTo = function (x, y) {
		this.queue.push(["lineTo", [x, y]]);
	};
	/**
	 * 曲線を描く
	 * @public
	 * @param x1 {Number} x1
	 * @param y1 {Number} y1
	 * @param x2 {Number} x2
	 * @param y2 {Number} y2
	 * @param radius {Number} radius
	 */
	Graphic.prototype.arcTo = function (x1, y1, x2, y2, radius) {
		this.queue.push(["arcTo", [x1, y1, x2, y2, radius]]);
	};
	/**
	 * ベジェ曲線を描く
	 * @public
	 * @param x1 {Number} x1
	 * @param y1 {Number} y1
	 * @param x2 {Number} x2
	 * @param x2 {Number} y2
	 * @param centerX {Number} centerX
	 * @param centerY {Number} centerY
	 */
	Graphic.prototype.bezierCurveTo = function (x1, y1, x2, y2, centerX, centerY) {
		this.queue.push(["bezierCurveTo", [x1, y1, x2, y2, centerX, centerY]]);
	};
	/**
	 * 指定位置に書き出し位置を移動する
	 * @public
	 * @param x {Number} x
	 * @param y {Number} y
	 */
	Graphic.prototype.moveTo = function (x, y) {
		this.queue.push(["moveTo", [x, y]]);
	};
	/**
	 * 扇形を描く
	 * @public
	 * @param x {Number} x
	 * @param y {Number} y
	 * @param radius {Number} radius
	 * @param tilt {Number} tilt
	 * @param angle {Number} angle
	 */
	Graphic.prototype.fan = function (x, y, radius, tilt, angle) {
		this.moveTo(x, y);
		this.queue.push(["arc", [x, y, radius, ((tilt - 90) * Graphic.DEG_TO_RAD), (((tilt - 90) + angle) * Graphic.DEG_TO_RAD), false]]);
	};

	/**
	 * 円弧を描く
	 * @param x {Number} x
	 * @param y {Number} y
	 * @param radius {Number} radius
	 * @param startAngle {Number} angle
	 * @param endAngle {Number} angle
	 * @param anticlockwise {Boolean}
	 */
	Graphic.prototype.arc = function (x, y, radius, startAngle, endAngle, anticlockwise) {
		startAngle = startAngle * Graphic.DEG_TO_RAD;
		endAngle = endAngle * Graphic.DEG_TO_RAD;
		this.queue.push(["arc", [x, y, radius, startAngle, endAngle, anticlockwise]]);
	};
	cavy.Graphic = Graphic;
})(window);