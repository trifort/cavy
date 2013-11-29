(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * 線形グラデーションクラス
	 * @alias cavy.LinearGradient
	 * @augments cavy.BackgroundColor
	 * @param width {Number} 横幅
	 * @param height {Number} 高さ
	 * @constructor
	 */
	var LinearGradient = function (width, height) {
		this.x = 0;
		this.y = 0;
		this.width = width || null;
		this.height = height || null;
		this.steps = [];
	};
	LinearGradient.prototype = Object.create(cavy.BackgroundColor.prototype);
	LinearGradient.prototype.constructor = LinearGradient;
	/**
	 * グラデーションステップを追加
	 * @public
	 * @param step {Number} グラデーションステップ(0-1)
	 * @param color {String} 色(#000,black)
	 */
	LinearGradient.prototype.addStep = function (step, color) {
		this.steps.push([step, color]);
	};
	/**
	 * グラデーションを描画する
	 * @private
	 * @param ctx
	 * @returns {CanvasGradient}
	 */
	LinearGradient.prototype.draw = function (ctx) {
		var x = this.x || 0, y = this.y || 0,
			width = this.width || 0, height = this.height || 0,
			grad = ctx.createLinearGradient(x, y, width, height),
			l = this.steps.length,
			i = 0;
		for (; i < l; i++) {
			var s = this.steps[i];
			grad.addColorStop(s[0], s[1]);
		}
		return grad;
	};
	cavy.LinearGradient = LinearGradient;
})(window);