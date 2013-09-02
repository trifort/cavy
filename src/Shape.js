/**
 * @fileOverview Shape
 * @version 0.0.1
 **/
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
		cavy.Graphic.apply(this, [obj, param]);
	};
	Shape.prototype = Object.create(cavy.Graphic.prototype);
	Shape.prototype.constructor = Shape;
	/**
	 * 図形を描画
	 * @private
	 * @param ctx
	 */
	Shape.prototype.draw = function (ctx) {
        if (!this.parent) {return;}
		var p = this.update(), m = this.matrix;
		this.updateContext(ctx);
		this.drawPath(ctx, p, m);
	};
	cavy.Shape = Shape;
})(window);