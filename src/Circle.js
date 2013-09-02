/**
 * @fileOverview Circle
 * @version 0.0.1
 **/
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * キャンバスに円を書き出すクラス
	 * @alias cavy.Circle
	 * @augments cavy.Graphic
	 * @param radius {Number} 半径
	 * @param startAngle {Number} 円開始角度
	 * @param endAngle {Number} 円終了角度
	 * @param anticlockwise {Boolean} 逆回り
	 * @param param {Object} 初期パラメーター
	 * @constructor
	 */
	var Circle = function (radius, startAngle, endAngle, anticlockwise, param) {
		/**
		 * 半径
		 * @type {number}
		 */
		this.radius = radius || 100;
		/**
		 * 開始角度
		 * @type {number}
		 */
		this.startAngle = startAngle || 0;
		/**
		 * 終了角度
		 * @type {number}
		 */
		this.endAngle = endAngle || 360;
		/**
		 * 反転フラグ
		 * @type {boolean}
		 */
		this.anticlockwise = this.anticlockwise || false;
		var obj = {
			width: radius * 2,
			height: radius * 2
		};
		cavy.Graphic.apply(this, [obj, param]);
	};
	Circle.prototype = Object.create(cavy.Graphic.prototype);
	Circle.prototype.constructor = Circle;
	/**
	 * 円を書き出す
	 * @private
	 * @param ctx {Context}
	 */
	Circle.prototype.draw = function (ctx) {
        if (!this.parent) {return;}
		var p = this.update(), m = this.matrix;
		this.updateContext(ctx);
		this.arc(p.sx + this.radius, p.sy + this.radius, this.radius, this.startAngle, this.endAngle, this.anticlockwise);
		this.drawPath(ctx, p, m);
		this.queue = [];
	};
	cavy.Circle = Circle;
})(window);