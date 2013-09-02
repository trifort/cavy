/**
 * @fileOverview InteractiveObject
 * @version 0.0.1
 **/
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * イベントの発火対象かどうかや当たり判定を持つクラス
	 * @alias cavy.InteractiveObject
	 * @augments cavy.DisplayObject
	 * @param source {HTMLImageObject} イメージオブジェクト
	 * @param param {Object} 初期パラメータ
	 * @constructor
	 */
	var InteractiveObject = function (source, param) {
		cavy.DisplayObject.apply(this, [source, param]);
	};
	InteractiveObject.prototype = Object.create(cavy.DisplayObject.prototype);

	InteractiveObject.prototype.constructor = InteractiveObject;
	/**
	 * 指定した座標に要素があるかどうか
	 * @public
	 * @param x {Number} x
	 * @param y {Number} y
	 * @returns {boolean} 指定座標に要素があるかどうか
	 */
	InteractiveObject.prototype.hitTest = function (x, y) {
		if (this.mask) {
			var maskRect = this.mask.getBoundingRect();
			if (x >= maskRect.left && x <= maskRect.right && y >= maskRect.top && y <= maskRect.bottom) {
				return true;
			}
			return false;
		} else {
			var rect = this.getBoundingRect();
			if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
				return true;
			}
		}
		
		return false;
	};
	/**
	 * 指定オブジェクトと接触しているかどうか
	 * @param target {DisplayObject}
	 * @returns {boolean}
	 */
	InteractiveObject.prototype.hitTestObject = function (target) {
		var rectA = this.getBoundingRect(),
			rectB = target.getBoundingRect();
		if (this.mask && !detail) {
			rectA = this.mask.getBoundingRect();
		}
		if (target.mask && !detail) {
			rectB = this.mask.getBoundingRect();
		}
		return (rectA.left <= rectB.right && rectA.left <= rectB.top && rectA.right >= rectB.left && rectA.bottom >= rectB.bottom);
	};
	cavy.InteractiveObject = InteractiveObject;
})(window);