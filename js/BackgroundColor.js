(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * BackgroundColor
	 * @alias cavy.BackgroundColor
	 * @constructor
	 */
	var BackgroundColor = function () {
	};
	BackgroundColor.prototype.constructor = BackgroundColor;
	/**
	 * @protected
	 * @returns {string} transparent
	 */
	BackgroundColor.prototype.draw = function () {
		return "transparent";
	};
	cavy.BackgroundColor = BackgroundColor;
})(window);