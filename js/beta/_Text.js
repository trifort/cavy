/**
 * @fileOverview Text
 **/
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};

	/**
	 * テキストサイズ計測用キャンバス
	 * @type {HTMLElement}
	 * @private
	 */
	cavy._textCache = document.createElement("canvas");
	/**
	 * テキストサイズ計測用コンテキスト
	 * @type {Object}
	 * @private
	 */
	cavy._textContext = cavy._textCache.getContext("2d");
	
	/**
	 * canvasにテキストを配置するオブジェクトクラス
	 * @constructor
	 * @alias cavy.Text
	 * @augments cavy.DisplayObject
	 * @param text {Object} 表示する文字列
	 * @param param {Object} 初期パラメータ
	 * @example
	 *    var t = new Text("hoge");
	 */
	var Text = function (text,param) {
		this._width = 0;
		this._height = 0;
		
		this._fontSize = "14px";
		this._fontFamily = "Arial";
		this._lineHeight = "1.5";
		this._textBaseline = "alphabetic";
		this._shadow = false;
		this._shadowX = 0;
		this._shadowY = 0;
		this._shadowBlur = 0;
		this._bold = false;
		this._isClear = false;
		this._textHeight = 0;
		this._textList = [];
		this._text = String(text);
		this._textList = this._text.split("\n");
		
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
		 * シャドウカラー
		 * @type {string}
		 * @default "#000"
		 */
		this.shadowColor = "#333";
		/**
		 * アウトライン表示
		 * @type {boolean}
		 * @default false
		 */
		this.outline = false;
		/**
		 * 自動リサイズを行うかどうか
		 * @type {boolean}
		 * @default false
		 */
		this.autoResize = true;
		cavy.InteractiveObject.apply(this, [null, param]);
	};
	Text.prototype = Object.create(cavy.InteractiveObject.prototype,{
		/**
		 * 表示テキスト
		 * @memberof cavy.Text.prototype
		 * @type {string}
		 * @default ""
		 */
		text: {
			get: function() { return this._text },
			set: function(value) {
				this._text = String(value);
				this._textList = this._text.split("\n");
				this.updateText(true);
			}
		},
		/**
		 * フォントサイズ
		 * @memberof cavy.Text.prototype
		 * @type {string}
		 * @default "14px"
		 */
		fontSize: {
			get: function() { return this._fontSize },
			set: function(value) { this._fontSize = value;this.updateText(true); }
		},
		/**
		 * フォントファミリー
		 * @memberof cavy.Text.prototype
		 * @type {string}
		 * @default "Arial"
		 */
		fontFamily: {
			get: function() { return this._fontFamily },
			set: function(value) { this._fontFamily = value;this.updateText(true); }
		},
		/**
		 * 文字ベースライン
		 * @memberof cavy.Text.prototype
		 * @type {string}
		 * @default "alphabetic"
		 */
		textBaseline: {
			get: function() { return this._textBaseline },
			set: function(value) { this._textBaseline = value;this.updateText(true); }
		},
		/**
		 * 行間
		 * @memberof cavy.Text.prototype
		 * @type {number}
		 * @default 1.5
		 */
		lineHeight: {
			get: function() { return this._lineHeight },
			set: function(value) { this._lineHeight = value;this.updateText(true); }
		},
		/**
		 * 太字
		 * @memberof cavy.Text.prototype
		 * @type {boolean}
		 * @default false
		 */
		bold: {
			get: function() { return this._bold },
			set: function(value) { this._bold = value;this.updateText(true); }
		},
		/**
		 * 横幅
		 * @memberof cavy.Text.prototype
		 * @type {boolean}
		 * @default false
		 */
		width: {
			get: function() { return this._width },
			set: function(value) { this._width = value;this.updateText(true); }
		},
		/**
		 * 高さ
		 * @memberof cavy.Text.prototype
		 * @type {boolean}
		 * @default false
		 */
		height: {
			get: function() { return this._height },
			set: function(value) { this._height = value;this.updateText(true); }
		},
		/**
		 * テキストシャドウ
		 * @memberof cavy.Text.prototype
		 * @type {boolean}
		 * @default false
		 */
		shadow: {
			get: function() { return this._shadow },
			set: function(value) { this._shadow = value;this.updateText(true); }
		},
		/**
		 * シャドウX値
		 * @memberof cavy.Text.prototype
		 * @type {number}
		 * @default 0
		 */
		shadowX: {
			get: function() { return this._shadowX },
			set: function(value) { this._shadowX = value;this.updateText(true); }
		},
		/**
		 * シャドウY値
		 * @memberof cavy.Text.prototype
		 * @type {number}
		 * @default 0
		 */
		shadowY: {
			get: function() { return this._shadowY },
			set: function(value) { this._shadowY = value;this.updateText(true); }
		},
		/**
		 * シャドウぼかし
		 * @memberof cavy.Text.prototype
		 * @type {number}
		 * @default 0
		 */
		shadowBlur: {
			get: function() { return this._shadowBlur },
			set: function(value) { this._shadowBlur = value;this.updateText(true); }
		}
	});
	Text.prototype.constructor = Text;
	
	Text.prototype.updateText = function(clearCache) {
		this._textHeight = parseFloat(this._fontSize.replace(/[^0-9]/g,""))
		if (!this.autoResize) {return;}
		var ctx = cavy._textContext;
		var width = this.width,
			height = this.height,
			l = this._textList.length;
		this.setStyle(ctx);
		for (var i = 0; i < l; i++) {
			var w = ctx.measureText(this._textList[i]).width;
			if (width < w) {
				width = w;
			}
		}
		
		var lh = this._textHeight * this.lineHeight;
		if (height < lh * l) {
			height = lh * l;
		}
		this._width = width;
		this._height = height;
		this.source = {
			width: width,
			height: height
		};
		if (clearCache) {
			this._isClear = true;
		}
	};
	/**
	 * canvasに文字列を出力
	 * @private
	 * @param ctx {Context} Stageコンテキスト
	 * @return {void}
	 **/
	Text.prototype.draw = function (ctx,cached) {
		if (!this.text || !this.parent) {
			return;
		}
		if (this.cache && !this._isClear) {
			this._draw(ctx);
		} else {
			if (this.filters && this.filters.length && !cached) {
				this.createCache();
				cavy.Filter.apply(this.cache,this.filters);
			} else {
				this.drawText(ctx);
			}
		}
		this._isClear = false;
	};
	Text.prototype._draw = function(ctx) {
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
	Text.prototype.drawText = function(ctx,cache) {
		this.update();
		this.updateContext(ctx);
		this.setStyle(ctx);
		var alignX = 0,
			l = this._textList.length,
			lh = this._textHeight * this.lineHeight;
		switch(this.textAlign) {
			case "center":
				alignX = this.width / 2;
				break;
			case "right":
				alignX = this.width;
				break;
			case "left":
			default:
				break;
		}
		
		while(l--) {
			var t = this._textList[l];
			if (this.outline) {
				ctx.strokeText(t, alignX, this._textHeight + l * lh);
			} else {
				ctx.fillText(t, alignX, this._textHeight + l * lh);
			}
		}
	};
	Text.prototype.setStyle = function(ctx) {
		var bold = this.bold ? "bold" : "";
		ctx.font = bold + " " + this._fontSize + " '" + this._fontFamily + "'";
		ctx.textAlign = this.textAlign;
		ctx.textBaseline = this._textBaseline;
		if (this.shadow) {
			ctx.shadowColor = this.shadowColor;
			ctx.shadowOffsetX = this._shadowX;
			ctx.shadowOffsetY = this._shadowY;
			ctx.shadowBlur = this._shadowBlur;
		}
		if (this.outline) {
			ctx.strokeStyle = this.color;
		} else {
			ctx.fillStyle = this.color;
		}
	};
	cavy.Text = Text;
	cavy.TextObject = Text;
})(window);