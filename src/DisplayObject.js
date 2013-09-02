/**
 * @fileOverview DisplayObject
 * @version 0.0.1
 */
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * DisplayObject
	 * @alias cavy.DisplayObject
	 * @augments cavy.EventDispatcher
	 * @param source {HTMLImageElement} イメージオブジェクト
	 * @param param {Object} (option)初期パラメータ
	 * @constructor
	 */
	var DisplayObject = function (source, param) {
		cavy.EventDispatcher.apply(this);
		/**
		 * Spirteに表示する要素
		 * @public
		 * @type {*}
		 */
		this.source = source;
		if (typeof this.source === "string") {
			var image = new Image();
			image.src = this.source;
			this.source = image;
		}
		/**
		 * 親要素
		 * @public
		 * @type {null|DisplayObject}
		 */
		this.parent = null;
		/**
		 * 横幅
		 * @public
		 * @type {Number}
		 */
		this.width = this.source ? this.source.width : 0;
		/**
		 * 高さ
		 * @public
		 * @type {Number}
		 */
		this.height = this.source ? this.source.height : 0;
		/**
		 * イメージをwidth,heightに合わせて変形
		 * @public
		 * @type {boolean}
		 */
		this.fitImage = false;

		/**
		 * fitImageがtrueのときで基準とする方向(normal/width/height/cover/contain)
		 * @public
		 * @type {String}
		 */
		this.fitType = "normal";
		/**
		 * x座標
		 * @public
		 * @type {number}
		 */
		this.x = 0;
		/**
		 * y座標
		 * @public
		 * @type {number}
		 */
		this.y = 0;
		/**
		 * offsetX
		 * @public
		 * @type {number}
		 */
		this.offsetX = 0;
		/**
		 * offsetY
		 * @public
		 * @type {number}
		 */
		this.offsetY = 0;

		/**
		 * positionX
		 * @public
		 * @type {number}
		 */
		this.positionX = 0;

		/**
		 * positionY
		 * @public
		 * @type {number}
		 */
		this.positionY = 0;
		/**
		 * x拡大率
		 * @public
		 * @type {number}
		 */
		this.scaleX = 1;
		/**
		 * y拡大率
		 * @public
		 * @type {number}
		 */
		this.scaleY = 1;
		/**
		 * x基準点
		 * @public
		 * @type {number}
		 */
		this.originX = 0;
		/**
		 * y基準点
		 * @public
		 * @type {number}
		 */
		this.originY = 0;
		/**
		 * 透明度
		 * @public
		 * @type {number}
		 */
		this.opacity = 1;
		/**
		 * 回転値
		 * @public
		 * @type {number}
		 */
		this.rotation = 0;
		/**
		 * x傾き
		 * @public
		 * @type {number}
		 */
		this.skewX = 0;
		/**
		 * y傾き
		 * @public
		 * @type {number}
		 */
		this.skewY = 0;
		/**
		 * 表示
		 * @public
		 * @type {boolean}
		 */
		this.visible = true;
		/**
		 * フィルター(source-over,source-atop,source-in,source-out,destination-atop,destination-in,destination-out,destination-over,lighter,copy,xor)
		 * @public
		 * @default null
		 * @type {String}
		 */
		this.filter = null;
		/**
		 * 子要素配列
		 * @public
		 * @type {Array}
		 */
		this.children = [];
		/**
		 * Matrix2D
		 * @public
		 * @type {cavy.Matrix2D}
		 */
		this.matrix = new cavy.Matrix2D();

		/**
		 * Mask
		 * @public
		 * @type {cavy.Graphic|null}
		 */
		this.mask = null;

		/**
		 * イベントを取得するかどうか
		 * @public
		 * @type {boolean}
		 */
		this.interactive = true;

		/**
		 * キャッシュ用キャンバス
		 * @private
		 * @type {HTMLCanvasElement|null}
		 */
		this.cache = null;

		/**
		 * イメージキャッシュ用キャンバス
		 * @private
		 * @type {HTMLImageElement|null}
		 */
		this.imageCache = null;

        /**
         * 画面外非表示フラグ
         * @private
         * @type {boolean}
         */
        this._visible = true;
		
		this._param = new ParamObject();

		if (param && typeof param === "object") {
			this.set(param);
		}
	};
	DisplayObject.prototype = Object.create(cavy.EventDispatcher.prototype);
	DisplayObject.prototype.constructor = DisplayObject;

	/**
	 * パラメータを一括で設定
	 * @public
	 * @param param {Object} パラメータオブジェクト
	 * @returns {DisplayObject} 自身のオブジェクト
	 * @example displayobj.set({
	 *		x: 100,
	 * 		y: 200
     * });
	 */
	DisplayObject.prototype.set = function (param) {
		for (var key in param) {
			this[key] = param[key];
		}
		return this;
	};
	/**
	 * targetに指定した要素にaddChildする
	 * @public
	 * @param target {cavy.Stage} ステージオブジェクト
	 * @returns {DisplayObject} 自身のオブジェクト
	 */
	DisplayObject.prototype.addTo = function (target) {
		target.addChild(this);
		return this;
	};
	/**
	 * targetに指定した要素からremoveChildする
	 * @public
	 * @param target {cavy.Stage} ステージオブジェクト
	 * @returns {DisplayObject} 自身のオブジェクト
	 */
	DisplayObject.prototype.removeFrom = function (target) {
		target.removeChild(this);
		return this;
	};
	/**
	 * 子要素を追加する
	 * @public
	 * @param sprite {DisplayObject} 追加要素
	 * @returns {DisplayObject} 自身のオブジェクト
	 */
	DisplayObject.prototype.addChild = function (sprite) {
		sprite.parent = this;
		this.children.push(sprite);
		return this;
	};
	/**
	 * 指定した深度に子要素を追加
	 * @public
	 * @param sprite {DisplayObject} 追加要素
	 * @param index {Int} 深度
	 * @returns {DisplayObject} 自身のオブジェクト
	 */
	DisplayObject.prototype.addChildAt = function (sprite, index) {
		if (sprite.parent) {
			sprite.parent.removeChild(sprite)
		}
		if (index > this.children.length) {
			window.console.error("INDEX_ERROR");
			return this;
		}
		sprite.parent = this;
		this.children.splice(index, 0, sprite);
		return this;
	};

	/**
	 * 指定深度の子要素を入れ替える
	 * @public
	 * @param sprite {DisplayObject} 入れ替える要素
	 * @param index {Int} 深度
	 * @returns {DisplayObject} 自身のオブジェクト
	 */
	DisplayObject.prototype.replaceChild = function (sprite, index) {
		if (sprite.parent) {
			sprite.parent.removeChild(sprite);
		}
		if (index > this.children.length) {
			window.console.error("INDEX_ERROR");
			return this;
		}
		sprite.parent = this;
		this.children[index] = sprite;
		return this;
	};
	/**
	 * aとbの深度を入れ替える
	 * @public
	 * @param a {DisplayObject} 子要素A
	 * @param b {DisplayObject} 子要素B
	 * @returns {DisplayObject} 自身のオブジェクト
	 */
	DisplayObject.prototype.swapChild = function (a, b) {
		var aIndex = this.children.indexOf(a);
		var bIndex = this.children.indexOf(b);
		this.swapChildAt(aIndex, bIndex);
		return this;
	};
	/**
	 * 指定深度にあるa,bを入れ替える
	 * @public
	 * @param a {DisplayObject} 子要素A
	 * @param b {DisplayObject} 子要素B
	 * @returns {DisplayObject} 自身のオブジェクト
	 */
	DisplayObject.prototype.swapChildAt = function (a, b) {
		if (a !== -1 && b !== -1) {
			var temp = this.children[a];
			this.children[a] = b;
			this.children[b] = temp;
		}
		return this;
	};
	/**
	 * 自身の深度を指定深度に設定する
	 * @public
	 * @param index {Int} 深度
	 * @returns {DisplayObject} 自身のオブジェクト
	 */
	DisplayObject.prototype.setIndex = function (index) {
		if (!this.parent) {
			return this;
		}
		this.parent.setChildIndex(this, index);
		return this;
	};
	/**
	 * 指定した要素を指定深度へ移動する
	 * @public
	 * @param sprite {DisplayObject} 変更したい子要素
	 * @param index {Int} 深度
	 * @returns {DisplayObject} 自身のオブジェクト
	 */
	DisplayObject.prototype.setChildIndex = function (sprite, index) {
		if (index > this.children.length) {
			window.console.error("INDEX_ERROR");
			return this;
		}
		var i = this.children.indexOf(sprite);
		if (i !== -1) {
			this.children.splice(i, 1);
			this.children.splice(index, 0, sprite);
		}
		return this;
	};
	/**
	 * 指定要素を子要素から削除する
	 * @public
	 * @param sprite {DisplayObject} 削除する子要素
	 * @returns {DisplayObject} 自身のオブジェクト
	 */
	DisplayObject.prototype.removeChild = function (sprite) {
		var index = this.children.indexOf(sprite);
		if (index !== -1) {
			this.children.splice(index, 1);
		}
		sprite.parent = null;
		return this;
	};
	/**
	 * 指定深度にある要素を子要素から削除する
	 * @public
	 * @param index {Int} 深度
	 * @returns {DisplayObject} 自身のオブジェクト
	 */
	DisplayObject.prototype.removeChildAt = function (index) {
		this.children.splice(index, 1);
		return this;
	};
	/**
	 * 子要素をすべて削除する
	 * @public
	 * @returns {DisplayObject} 自身のオブジェクト
	 */
	DisplayObject.prototype.removeAllChildren = function () {
		var l = this.children.length;
		while (l--) {
			this.removeChild(this.children[l]);
		}
		this.children = [];
		return this;
	};
	DisplayObject.prototype.adjustSource = function (dir) {
		if (dir === "width") {
			this.height = this.source.height * this.width / this.source.width;
		} else {
			this.width = this.source.width * this.height / this.source.height;
		}
	};
	/**
	 * 要素の位置情報を更新する
	 * @public
	 * @returns {{x: number, y: number, width: Number, height: Number, sx: number, sy: number, innerWidth: Number, innerHeight: Number, visible: *}}
	 */
	DisplayObject.prototype.update = function () {
		this._param.initialize(this);
		if (this.fitImage && this.source) {
			this._param.fitSource(this.source,this.fitType);
			if (this.fitType === "contain") {
				this.width = this._param.width;
				this.height = this._param.height;
			}
		}
		return this._param;
	};
	/**
	 * Stage要素を取得する
	 * @public
	 * @returns {cavy.Stage|null} ステージオブジェクト
	 */
	DisplayObject.prototype.getStage = function () {
		if (this instanceof cavy.Stage) {
			return this;
		} else if (this.parent) {
			return this.parent.getStage();
		}
		return null;
	};
	/**
	 * 要素を複製する
	 * @public
	 * @returns {cavy.DisplayObject} 複製した要素
	 */
	DisplayObject.prototype.clone = function () {
		var c = new this.constructor();
		c = (function copy(obj, base) {
			if (!obj) {
				return base;
			}
			var props = Object.getOwnPropertyNames(base);
			var i = 0, len = props.length;
			for (; i < len; i++) {
				var p = props[i];
				if (base.hasOwnProperty(p)) {
					if (base[p] && typeof base[p] === "object") {
						obj[p] = copy(obj[p], base[p]);
					} else {
						Object.defineProperty(obj, p, Object.getOwnPropertyDescriptor(base, p));
					}
				}
			}
			return obj;
		})(c, this);
		return c;
	};
	/**
	 * BoundingRectを取得する
	 * @public
	 * @returns {Object} bounds
	 */
	DisplayObject.prototype.getBoundingRect = function () {
		this.update();
		var bounds = this.getBounds();
		return this.convertBoundaryRect(bounds);
	};

	/**
	 * BoundingRectを取得する
	 * @public
	 * @returns {Object} bounds
	 */
	DisplayObject.prototype.getBounds = function () {
		var width = this.width,
			height = this.height,
			m = this.matrix,
			result = {
				top: m.e,
				left: m.f,
				right: m.e + width,
				bottom: m.f + height,
				width: width,
				height: height
			};
		if (!this.parent) {
			return result;
		}

		var tl = m;
		var tr = new cavy.Matrix2D().translate(width, 0).prependMatrix(m);
		var bl = new cavy.Matrix2D().translate(0, height).prependMatrix(m);
		var br = new cavy.Matrix2D().translate(width, height).prependMatrix(m);

		var points = [
			[tl.e, tl.f],
			[tr.e, tr.f],
			[bl.e, bl.f],
			[br.e, br.f]
		];
		return points;
	};

	/**
	 * 座標配列から４点座標とwidth,heightに変換
	 * @private
	 * @param aPoints
	 * @returns {{left: *, right: *, top: *, bottom: *, width: number, height: number}}
	 */
	DisplayObject.prototype.convertBoundaryRect = function (aPoints) {
		var nMinX = aPoints[0][0],
			nMaxX = aPoints[0][0],
			nMinY = aPoints[0][1],
			nMaxY = aPoints[0][1],
			l = aPoints.length;
		while (l--) {
			nMinX = Math.min(nMinX, aPoints[l][0]);
			nMaxX = Math.max(nMaxX, aPoints[l][0]);
			nMinY = Math.min(nMinY, aPoints[l][1]);
			nMaxY = Math.max(nMaxY, aPoints[l][1]);
		}
		return {
			left: nMinX,
			right: nMaxX,
			top: nMinY,
			bottom: nMaxY,
			width: nMaxX - nMinX,
			height: nMaxY - nMinY
		};
	};
	/**
	 * キャッシュを生成。キャッシュ生成後は子要素へのプロパティ変更が反映されません
	 * @public
	 */
	DisplayObject.prototype.createCache = function (imageCache) {
		var cache = this.cache || document.createElement("canvas"),
			ctx = cache.getContext("2d");
		this.clearCanvas(ctx,cache.width,cache.height);
		cache.width = this.width;
		cache.height = this.height;
		this.update();
		this._drawCache([this], ctx);
		this.cache = cache;
		if (imageCache) {
			this.imageCache = this.imageCache || new Image();
			this.imageCache.src = cache.toDataURL();
			if (this.imageCache.src !== "data:,") {
				this.clearCanvas(ctx,cache.width,cache.height);
			}
		}
	};

	DisplayObject.prototype.clearCanvas = function(ctx,width,height) {
		var m = (width + 255) >> 8,
			n = (height + 255) >> 8;
		while (m--) {
			var i = 0;
			for (; i < n; i++) {
				ctx.clearRect(m << 8, i << 8, 256, 256);
			}
		}
	};
	
	/**
	 * キャッシュを描画
	 * @private
	 * @children {Array} 子要素配列
	 * @ctx {Context}
	 *
	 */
	DisplayObject.prototype._drawCache = function (children, ctx) {
		if (!children) { return;}
		var c = children.slice();
		var i = 0, l = c.length;
		for (; i < l; i++) {
			var s = c[i];
			if (!s.visible) { continue; }
			var rect = this.getBoundingRect();
			ctx.setTransform(1, 0, 0, 1, -rect.left, -rect.top);
			s.draw(ctx);
			if (s.children.length !== 0 && !s.cache) {
				this._drawCache(s.children, ctx);
			}
		}
	};
	/**
	 * キャッシュを削除
	 * @public
	 */
	DisplayObject.prototype.deleteCache = function () {
		this.imageCache = null;
		if (this.cache) {
			var ctx = this.cache.getContext("2d");
			this.clearCanvas(ctx,this.cache.width,this.cache.height);
		}
		this.cache = null;
	};
	/**
	 * マスクや透明度、位置を書き出し
	 * @private
	 * @param ctx
	 */
	DisplayObject.prototype.updateContext = function (ctx) {
		if (!this.parent) {return;}
		var m = this.matrix,
			mask = this.mask || this.parent.mask;
		if (mask) {
			ctx.translate(m.e, m.f);
			mask.draw(ctx, true);
			ctx.clip();
		}
		if (this.filter) {
			ctx.globalCompositeOperation = this.filter;
		}
		if (m.opacity !== 1) {
			ctx.globalAlpha = m.opacity;
		}
		ctx.transform(m.a, m.b, m.c, m.d, m.e, m.f);
	};

	/**
	 * DisplayObjectパラメータオブジェクト
	 * @private
	 * @param x {Number}
	 * @param y {Number}
	 * @param w {Number}
	 * @param h {Number}
	 * @param visible {Boolean}
	 * @constructor
	 */
	var ParamObject = function() {
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		this.sx = 0;
		this.sy = 0;
		this.innerWidth = 0;
		this.innerHeight = 0;
		this.visible = false;
	};
	ParamObject.prototype = {
		initialize: function(obj) {
			this.x = obj.x;
			this.y = obj.y;
			this.width = obj.width;
			this.height = obj.height;
			this.innerWidth = obj.width;
			this.innerHeight = obj.height;
			this.visible = obj.visible;
			this.sx = obj.offsetX * this.width + obj.positionX;
			this.sy = obj.offsetY * this.width + obj.positionY;
			if (cavy.pixelSnap) {
				this.pixelSnap();
			}
			this.setMatrix(obj);
		},
		/**
		 * ピクセルスナップさせる
		 */
		pixelSnap: function() {
			this.x = (0.5 + this.x) | 0;
			this.y = (0.5 + this.y) | 0;
			this.sx = (0.5 + this.sx) | 0;
			this.sy = (0.5 + this.sy) | 0;
		},
		/**
		 * sourceをフィットさせる
		 * @param source
		 * @param fitType
		 */
		fitSource: function(source,fitType) {
			this.innerWidth = source.width;
			this.innerHeight = source.height;
			switch(fitType) {
				case "height":
					this.width = this.innerWidth * (this.height / this.innerHeight);
					break;
				case "width":
					this.height = this.innerHeight * (this.width / this.innerWidth);
					break;
				case "cover":
				case "contain":
					var size = this.getResizeData(this.innerWidth,this.innerHeight,fitType === "cover");
					this.width = size.width;
					this.height = size.height;
					break;
				default:
					break;
			}
		},
		/**
		 * Matrix2dをセットアップする
		 * @private
		 * @param obj
		 */
		setMatrix: function(obj) {
			obj.matrix.identity().appendMatrix(obj.parent.matrix).appendTransform(this.x, this.y, obj.scaleX, obj.scaleY, obj.rotation, obj.skewX, obj.skewY, this.width * obj.originX, this.height * obj.originY);
			obj.matrix.opacity *= obj.opacity;
		},
		/**
		 * souceイメージのリサイズ後のサイズを取得
		 * @private
		 * @param width {Int} リサイズwidth
		 * @param height {Int} リサイズheight
		 * @param overflow {Boolean} 溢れさせるかどうかのフラグ
		 * @returns {{width: *, height: *}}
		 */
		getResizeData: function(width,height,overflow) {
			var w = this.width;
			var h = this.height;
			var data = {
				width: width,
				height: height
			};
			var sw = w / width;
			var sh = h / height;
			var scale = 1;
			if(overflow) {
				if (sw > sh) {
					data.width = w;
					data.height = data.height * sw;
				} else {
					data.height = h;
					data.width = data.width * sh;
				}
			} else {
				if (sw < sh) {
					data.width = w;
					data.height = data.height * sw;
				} else {
					data.height = h;
					data.width = data.width * sh;
				}
			}
			return data;
		}
	};
	cavy.DisplayObject = DisplayObject;
})(window);