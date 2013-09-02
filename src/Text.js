/**
 * @fileOverview Text
 * @author yuu@creatorish
 * @version 0.0.1
 **/
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * canvasにテキストを配置するオブジェクトクラス
	 * @constructor
	 * @alias cavy.Text
	 * @augments cavy.DisplayObject
	 * @param text {Object} 表示する文字列
	 * @param param {Object} 初期パラメータ
	 * @example
	 *    var t = new Text("hoge");
	 **/
	var Text = function (text,width,height, param) {
		/**
		 * 表示テキスト
		 * @type {string}
		 */
		this.text = text;
		if (typeof width === "object") {
			param = width;
		} else if (width && height) {
			param = param || {};
			param.width = width;
			param.height = height;
		}
		/**
		 * フォントサイズ
		 * @type {string}
		 * @default "14px"
		 */
		this.fontSize = "14px";
		/**
		 * フォントファミリー
		 * @type {string}
		 * @default "Arial"
		 */
		this.fontFamily = "Arial";
		/**
		 * 太字
		 * @type {boolean}
		 * @default false
		 */
		this.bold = false;
		/**
		 * 文字色
		 * @type {string}
		 * @default "#000"
		 */
		this.color = "#000";
		/**
		 * 文字揃え
		 * @type {string}
		 * @default "left"
		 */
		this.textAlign = "left";
		/**
		 * 文字ベースライン
		 * @type {string}
		 * @default "alphabetic"
		 */
		this.textBaseline = "alphabetic";
		/**
		 * 行間
		 * @type {number}
		 * @default 1.5
		 */
		this.lineHeight = 1.5;
		/**
		 * テキストシャドウ
		 * @type {boolean}
		 * @default false
		 */
		this.shadow = false;
		/**
		 * シャドウカラー
		 * @type {string}
		 * @default "#000"
		 */
		this.shadowColor = "#333";
		/**
		 * シャドウX値
		 * @type {number}
		 * @default 0
		 */
		this.shadowX = 0;
		/**
		 * シャドウX値
		 * @type {number}
		 * @default 0
		 */
		this.shadowY = 0;
		/**
		 * シャドウぼかし
		 * @type {number}
		 * @default 0
		 */
		this.shadowBlur = 0;
		/**
		 * アウトライン表示
		 * @type {boolean}
		 * @default false
		 */
		this.outline = false;
		/**
		 * テキストキャッシュを持っているかどうか
		 * @type {boolean}
		 * @default false
		 */
		this.hasTextCache = false;
		/**
		 * 自動リサイズを行うかどうか
		 * @type {boolean}
		 * @default false
		 */
		this.autoResize = false;
		/**
		 * 自動的にキャッシュを生成するかどうか
		 * @type {boolean}
		 * @default true
		 */
		this.autoCache = true;
		/**
		 * サイズ測定用キャッシュキャンバス
		 * @type {*}
		 * @private
		 */
		this._sizeCache = document.createElement("canvas");
		/**
		 * サイズ測定用context
		 * @type {*|Boolean|Object}
		 * @private
		 */
		this._sizeContext = this._sizeCache.getContext("2d");
		/**
		 * パラメーターキャッシュ
		 * @type {{}}
		 * @private
		 */
		this._paramCache = {};
		/**
		 * リロードする対象パラメーター配列
		 * @type {Array}
		 * @private
		 */
		this._reloadParams = ["fontSize","fontFamily","textBaseline","lineHeight","text","bold","width","height"];
		cavy.InteractiveObject.apply(this, [null, param]);
	};
	Text.prototype = Object.create(cavy.InteractiveObject.prototype);
	Text.prototype.constructor = Text;

	/**
	 * テキストを再描画
	 */
	Text.prototype.reDraw = function() {
		this.hasTextCache = false;
	};

	/**
	 * canvasに文字列を出力
	 * @private
	 * @param ctx {Context} Stageコンテキスト
	 * @return {void}
	 **/
	Text.prototype.draw = function (ctx) {
		if (!this.text || !this.parent) {
			return;
		}
		var l = 0,
			p = null;
		if (this.hasTextCache) {
			l = this._reloadParams.length;
			while(l--) {
				p = this._reloadParams[l];
				if (this._paramCache[p] !== this[p]) {
					this.hasTextCache = false;
					break;
				}
			}
		}
		if (this.hasTextCache) {
			this.drawCache(ctx);
		} else {
			this.source = {
				width: this.width,
				height: this.height
			};
			this.drawText();
			this.drawCache(ctx);
			l = this._reloadParams.length;
			while(l--) {
				p = this._reloadParams[l];
				this._paramCache[p] = this[p];
			}
			this.hasTextCache = true;
		}
	};
	/**
	 * キャッシュを生成
	 * @param ctx {Context}
	 */
	Text.prototype.drawCache = function(ctx) {
		var p = this.update();
		this.updateContext(ctx);
		if (this.imageCache && this.imageCache.src !== "data:,") {
			ctx.drawImage(this.imageCache,0,0,p.width,p.height);
		} else {
			ctx.drawImage(this.cache,0,0,p.width,p.height);
		}
	};
	/**
	 * テキストを描画
	 */
	Text.prototype.drawText = function() {
		var cache = this.cache || document.createElement("canvas"),
			ctx = cache.getContext("2d"),
			alignX = 0,
			fontArr = [
				this.bold ? "bold" : "",
				this.parseFontSize(this.fontSize),
				"'" + this.fontFamily + "'"
			];

		this._sizeContext.font = fontArr.join(" ");
		var width = cavy.retina ? this.width * 2 : this.width,
			height = cavy.retina ? this.height * 2 : this.height,
			txt = String(this.text),
			h = this._sizeContext.measureText("Ｍ").width,
			textList = txt.split('\n'),
			l = textList.length,
			lh = h * this.lineHeight;
		if (this.autoResize || (width === 0 && height === 0)) {
			for (var i = 0; i < l; i++) {
				var w = this._sizeContext.measureText(textList[i]).width;
				if (width < w) {
					width = w;
				}
			}
			if (height < lh) {
				height = lh * l;
			}
		}
		
		this.clearCanvas(ctx,cache.width,cache.height);
		cache.width = width;
		cache.height = height;
		this.width = width / cavy.deviceRatio;
		this.height = height / cavy.deviceRatio;
		
		ctx.font = fontArr.join(" ");
		
		if (this.shadow) {
			ctx.shadowColor = this.shadowColor;
			ctx.shadowOffsetX = this.shadowX;
			ctx.shadowOffsetY = this.shadowY;
			ctx.shadowBlur = this.shadowBlur;
		}
		switch(this.textAlign) {
			case "center":
				alignX = cache.width / 2;
				break;
			case "right":
				alignX = cache.width;
				break;
			case "left":
			default:
				break;
		}
		ctx.textAlign = this.textAlign;
		ctx.textBaseline = this.textBaseline;
		if (this.outline) {
			ctx.strokeStyle = this.color;
		} else {
			ctx.fillStyle = this.color;
		}
		
		for (var i = 0; i < l; i++) {
			var t = textList[i];
			if (this.outline) {
				ctx.strokeText(t, alignX, h + i * lh);
			} else {
				ctx.fillText(t, alignX, h + i * lh);
			}
		}
		this.cache = cache;
		if (this.autoCache) {
			this.imageCache = this.imageCache || new Image();
			this.imageCache.src = cache.toDataURL();
			/*
			if (this.imageCache.src !== "data:,") {
				this.clearCanvas(ctx,cache.width,cache.height);
			}*/
		}
	};
	/**
	 * フォントサイズをRetina用に調整
	 * @private
	 * @param fontStr {String}
	 * @returns {String}
	 */
	Text.prototype.parseFontSize = function (fontStr) {
		var unit = String(fontStr).match(/mm|cm|in|pt|pc|em|ex|px|%/);
		if (!unit) {
			unit = null;
		}
		//数値を切り出し
		var num = parseFloat(String(fontStr).replace(unit, ""));
		if (isNaN(num)) {
			num = 0;
		}
		if (cavy.retina) {
			num *= 2;
		}
		return num + unit;
	};
	cavy.Text = Text;
	cavy.TextObject = Text;
})(window);