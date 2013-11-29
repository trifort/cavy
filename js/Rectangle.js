(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * canvasに矩形を配置するオブジェクトクラス
	 * @alias cavy.Rectangle
	 * @constructor
	 * @augments cavy.Graphic
	 * @param width {Number} 横幅
	 * @param height {Number} 高さ
	 * @param param {Object} 初期パラメータ
	 **/
	var Rectangle = function (w, h, param) {
		var obj = {
			width: w,
			height: h
		};
		cavy.Graphic.apply(this, [obj, param]);
	};
	Rectangle.prototype = Object.create(cavy.Graphic.prototype);
	Rectangle.prototype.constructor = Rectangle;
	/**
	 * 矩形を描画
	 * @private
	 * @param ctx
	 * @param mask
	 */
	Rectangle.prototype.draw = function (ctx, mask) {
        if (!this.parent && !mask) {return;}
		var p = this.update(),
			m = this.matrix;
		if (!mask) {
			this.updateContext(ctx);
		}
		this.rect(0, 0, p.innerWidth, p.innerHeight);
		this.drawPath(ctx, p, m, mask);
		this.queue = [];
	};
	cavy.Rectangle = Rectangle;
})(window);