
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
		cavy.Graphic.call(this,obj,param);
	};
	var p = Circle.prototype = Object.create(cavy.Graphic.prototype);
	p.constructor = Circle;
	/**
	 * 円を書き出す
	 * @private
	 * @param ctx {Context}
	 */
	p.draw = function (ctx,mask) {
		if (!this.parent && !mask) {return;}
		var p = this.update(),
			m = this.matrix;
		if (!mask) {
			this.updateContext(ctx);
		}
		this.arc(p.sx + this.radius, p.sy + this.radius, this.radius, this.startAngle, this.endAngle, this.anticlockwise);
		this.drawPath(ctx, p, m, mask);
		this.queue = [];
	};
	cavy.Circle = Circle;
})(window);