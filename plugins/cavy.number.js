/**
 * @fileOverview スプライトナンバープラグイン
 * @version 0.0.1
 **/
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * 
	 * @param stage
	 * @param data
	 * @param model
	 * @param option
	 * @constructor
	 */
	var NumberSprite = function(number,source,option) {
		cavy.Sprite.apply(this);
		this.setting = {
			width: 64,
			height: 64,
			scaleX: 1,
			scaleY: 1,
			spacing: 0
		};
		
		for (var key in option) {
			this.setting[key] = option[key];
		}
		
		this.number = source;
		this.initialize(number);
	};
	NumberSprite.prototype = Object.create(cavy.Sprite.prototype);
	NumberSprite.prototype.initialize = function(number) {
		this.numbers = String(number).split("");
		this.width = this.setting.width * this.numbers.length;
		this.height = this.setting.height;
		this.createNumber();
	};
	NumberSprite.prototype.createNumber = function() {
		for (var i = 0,len = this.numbers.length; i < len; i++) {
			var n = parseInt(this.numbers[i]);
			var sprite = new cavy.Sprite(this.number,this.setting);
			sprite.offsetX = n;
			sprite.x = i * this.setting.width * this.setting.scaleX + (this.setting.spacing*i);
			this.addChild(sprite);
		}
	};
	NumberSprite.prototype.setNumber = function(number) {
		this.initialize(number);
	};
	cavy.NumberSprite = NumberSprite;
})(window);