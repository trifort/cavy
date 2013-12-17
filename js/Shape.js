(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * 図形を描画するクラス
	 * @alias cavy.Shape
	 * @augments cavy.Graphic
	 * @param w {Number} 横幅
	 * @param h {Number} 高さ
	 * @param param {Object} 初期パラメータ
	 * @constructor
	 */
	var Shape = function (w, h, param) {
		var obj = {
			width: w,
			height: h
		};
		cavy.Graphic.call(this,obj,param);
	};
	var p = Shape.prototype = Object.create(cavy.Graphic.prototype);
	p.constructor = Shape;
	/**
	 * 図形を描画
	 * @private
	 * @param ctx
	 */
	p.draw = function (ctx,mask) {
		if (!this.parent && !mask) {return;}
		var p = this.update(),
			m = this.matrix;
		this.updateContext(ctx);
		this.drawPath(ctx, p, m, mask);
	};
	cavy.Shape = Shape;
})(window);