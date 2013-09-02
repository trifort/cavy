/**
 * @fileOverview CircleGradient
 * @version 0.0.1
 **/
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * 円形グラデーション
	 * @alias cavy.CircleGradient
	 * @augments cavy.BackgroundColor
	 * @param x0 {Number} 中心点x
	 * @param y0 {Number} 中心点y
	 * @param r0 {Number} 半径
	 * @param x1 {Number} (option)第２中心点x
	 * @param y1 {Number} (option)第２中心点y
	 * @param r1 {Number} (option)第２半径
	 * @constructor
	 */
	var CircleGradient = function (x0, y0, r0, x1, y1, r1) {
		this.x0 = x0 || 0;
		this.y0 = y0 || 0;
		this.x1 = x0 || 0;
		this.y1 = y0 || 0;
		this.r0 = r0 || 0;
		this.r1 = r1 || 0;
		this.steps = [];
	};
	CircleGradient.prototype = Object.create(cavy.BackgroundColor.prototype);
	CircleGradient.prototype.constructor = CircleGradient;
	/**
	 * グラデーションステップを追加
	 * @public
	 * @param step {Number} グラデーションステップ(0-1)
	 * @param color {String} 色(#000,black)
	 */
	CircleGradient.prototype.addStep = function (step, color) {
		this.steps.push([step, color]);
	};
	/**
	 * グラデーション書き出し
	 * @private
	 * @param ctx {Context}
	 * @param p {Object} プロパティオブジェクト
	 * @param m {cavy.Matrix2D} Matrixオブジェクト
	 * @returns {CanvasGradient}
	 */
	CircleGradient.prototype.draw = function (ctx, p, m) {
		var grad = ctx.createRadialGradient(this.x0 + p.width / 2, this.y0 + p.height / 2, this.r0, this.x1 + p.width / 2, this.y1 + p.height / 2, this.r1);
		var l = this.steps.length;
		for (var i = 0; i < l; i++) {
			var s = this.steps[i];
			grad.addColorStop(s[0], s[1]);
		}
		return grad;
	};
	cavy.CircleGradient = CircleGradient;
})(window);