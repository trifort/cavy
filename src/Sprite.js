/**
 * @fileOverview Sprite
 * @version 0.0.1
 **/
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * canvasに画像を配置するオブジェクトクラス
	 * @alias cavy.Sprite
	 * @constructor
	 * @augments cavy.InteractiveObject
	 * @param source {Object} widthとheightを持つオブジェクト
	 * @param param {Object} 初期パラメータ
	 **/
	var Sprite = function (source, param) {
		cavy.InteractiveObject.apply(this, [source, param]);
	};
	Sprite.prototype = Object.create(cavy.InteractiveObject.prototype);
	Sprite.prototype.constructor = Sprite;
	/**
	 * canvasに画像を出力
	 * @private
	 * @param ctx {Context} Stageコンテキスト
	 * @return {void}
	 **/
	Sprite.prototype.draw = function (ctx) {
		if (!this.parent) {return;}
		var p = this.update();
		this.updateContext(ctx);
		if (this.cache) {
            if (this.imageCache && this.imageCache.src !== "data:,") {
                ctx.drawImage(this.imageCache, 0, 0, this.imageCache.width, this.imageCache.height);
            } else {
    			ctx.drawImage(this.cache, 0, 0, this.cache.width, this.cache.height);
            }
        } else if (this.source) {
			if (p.sx + p.innerWidth > this.source.width) {
				p.width = this.source.width;
				p.innerWidth = this.source.width;
			}
			if (p.sy + p.innerHeight > this.source.height) {
				p.height = this.source.height
				p.innerHeight = this.source.height;
			}
			ctx.drawImage(this.source, p.sx, p.sy, p.innerWidth, p.innerHeight, 0, 0, p.width, p.height);
		}
	};
	cavy.Sprite = Sprite;
})(window);