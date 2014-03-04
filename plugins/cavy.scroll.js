/**
 * @fileOverview スクロールUIプラグイン
 * @version 0.0.1
 **/

(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	cavy.requestCount = 0;
	cavy.maxRequestCount = 10;
	/**
	 * スクロールステージ
	 * @param container
	 * @param width
	 * @param height
	 * @param interactive
	 * @param strictEvent
	 * @param option
	 * @constructor
	 */
	var ScrollStage = function(container, width, height, interactive, strictEvent,option) {
		cavy.Stage.apply(this,[container,width,height,interactive,strictEvent]);
		this.data = [];
		this.setting = {
			x: 0,
			y: 0,
			margin: 0,
			column: 5,
			row: NaN,
			scrollbar: true,
			scrollbarColor: "#333",
			scrollbarWidth: 6,
			inertiaTime: 512,
			inertia: 32,
			autoLoadCount: false
		};
		this.checkTimer;

		for (var key in option) {
			this.setting[key] = option[key];
		}
		this.wrap = new cavy.Sprite();

		this.scrollbarX,this.scrollbarY;
		if (this.setting.scrollbar) {
			this.scrollbarX = new cavy.Rectangle(0, this.setting.scrollbarWidth);
			this.scrollbarY = new cavy.Rectangle(this.setting.scrollbarWidth, 0);
		}
		this.touch = {
			x: 0,
			y: 0,
			dx: 0,
			dy: 0,
			timeStamp: 0
		};
		this.isMove = false;
		this.tween = null;
		this.oneRow = 0;
		this.inviews = [];

		var self = this;
		this._touchStartHandler = function(e) {
			self._touchStart(e);
		};
		this._touchMoveHandler = function(e) {
			self._touchMove(e);
		};
		this._touchEndHandler = function(e) {
			self._touchEnd(e);
		};
		this._stepHandler = function(e) {
			self._checkView(false,true);
		};
		this._checkHandler = function(e) {
			self._checkView();
		};
		this._compHandler = function(e) {
			self.isMove = false;
			self._checkView();
			self.checkTimer.play();
		};
		this.initialize();
	};
	ScrollStage.prototype = Object.create(cavy.Stage.prototype);
	/**
	 * 初期化
	 */
	ScrollStage.prototype.initialize = function() {
		this.x = this.setting.x;
		this.y = this.setting.y;
		this.width = this.width / cavy.deviceRatio - this.setting.margin;
		this.height = this.height / cavy.deviceRatio - this.setting.margin;
		this.addChild(this.wrap);
		if (this.setting.scrollbar) {
			this.scrollbarX.set({
				backgroundColor: this.setting.scrollbarColor,
				originY: 1,
				y: this.height + this.setting.margin
			});
			this.scrollbarY.set({
				backgroundColor: this.setting.scrollbarColor,
				originX: 1,
				x: this.width + this.setting.margin
			});
			this.addChild(this.scrollbarX);
			this.addChild(this.scrollbarY);
		}

		this.removeEventListener("touchmove",this._triggerHandler);
		this.container.addEventListener("touchstart", this._touchStartHandler);
		this.container.addEventListener("touchmove", this._touchMoveHandler);
		this.container.addEventListener("touchend", this._touchEndHandler);
		
		this.checkTimer = cavy.Timer.repeat(this._checkHandler);
	};
	/**
	 * タッチスタート処理
	 * @param e
	 * @private
	 */
	ScrollStage.prototype._touchStart = function(e) {
		this.touch.x = e.touches[0].pageX - this.x;
		this.touch.y = e.touches[0].pageY - this.y;
		this.touch.timeStamp = e.timeStamp;
		this.checkTimer.stop();
		e.preventDefault();
	};
	/**
	 * タッチムーブ処理
	 * @param e
	 * @private
	 */
	ScrollStage.prototype._touchMove = function(e) {
		if (this.tween) {
			this.tween.destroy();
			this.tween = null;
		}
		this.isMove = true;
		var x = e.touches[0].pageX - this.x;
		var y = e.touches[0].pageY - this.y;
		this.touch.dx = x - this.touch.x;
		this.touch.dy = y - this.touch.y;
		var pos = this._checkLimit(this.wrap.x + this.touch.dx,this.wrap.y + this.touch.dy);
		this.wrap.x = pos.x;
		this.wrap.y = pos.y;
		this.touch.x = x;
		this.touch.y = y;
		this.touch.timeStamp = e.timeStamp;
		this._checkView(false,true);
		e.preventDefault();
	};
	/**
	 * タッチエンド処理
	 * @param e
	 * @private
	 */
	ScrollStage.prototype._touchEnd = function(e) {
		if (this.isMove) {
			var interval = e.timeStamp - this.touch.timeStamp;
			if (interval < this.setting.inertiaTime) {
				var it = (this.setting.inertiaTime - interval) / this.setting.inertiaTime;
				var x = this.wrap.x + Math.ceil(this.touch.dx * it * this.setting.inertia);
				var y = this.wrap.y + Math.ceil(this.touch.dy * it * this.setting.inertia);
				var pos = this._checkLimit(x,y);
				this.tween = cavy.Tween(this.wrap).to({
					x: pos.x,
					y: pos.y
				}, "easeOutQuad", this.setting.inertiaTime*it).step(this._stepHandler).call(this._compHandler);
			}
		}
		e.preventDefault();
	};
	/**
	 * 上限値のチェック
	 * @param x
	 * @param y
	 * @returns {{x: *, y: *}} 上限内に収まる値
	 * @private
	 */
	ScrollStage.prototype._checkLimit = function(x,y) {
		if (x > 0) {
			x = 0;
		} else if (x < - this.wrap.width + this.width - this.setting.x) {
			x = -this.wrap.width + this.width - this.setting.x;
		}
		if (x > 0) {
			x = 0;
		}

		if (y > 0) {
			y = 0;
		} else if (y < - this.wrap.height + this.height - this.setting.y) {
			y = -this.wrap.height + this.height - this.setting.y;
		}
		if (y > 0) {
			y = 0;
		}
		return {x:x,y:y};
	};
	/**
	 * コンテンツの位置をセットする
	 * @param content
	 * @param i
	 * @private
	 */
	ScrollStage.prototype._setContent = function(content,i) {
		var column = Math.floor(i % this.setting.column);
		var row = isNaN(this.setting.row) ? Math.floor(i / this.setting.column) : Math.floor(i / this.setting.column) % this.setting.row;
		var page = isNaN(this.setting.row) ? 0 : Math.floor(i / (this.setting.column * this.setting.row));
		var l = Math.floor(column * content.width + this.setting.margin * column + this.setting.margin + content.width * content.originX);
		var t = Math.floor(row * content.height + this.setting.margin * row + this.setting.margin + content.height * content.originY);
		if (page !== 0) {
			l += this.width * page;
		}
		content.x = l;
		content.y = t;
		content.onChange();
	};
	/**
	 * コンテンツサイズを再計算する
	 */
	ScrollStage.prototype.refresh = function() {
		if (this.wrap.children.length === 0) {
			this.oneRow = 0;
			this.wrap.width = 0;
			this.wrap.height = 0;
		} else if (isNaN(this.setting.row)) {
			this.oneRow = Math.ceil(this.height / this.wrap.children[0].height)+1;
			var r = Math.ceil(this.data.length / this.setting.column);
			this.wrap.height = r * this.wrap.children[0].height + this.setting.margin * r;
		} else {
			var page = Math.ceil(this.data.length / (this.setting.column * this.setting.row));
			this.oneRow = this.setting.row;
			this.wrap.width = page * this.width;
			this.wrap.height = this.setting.row * this.wrap.children[0].height + this.setting.row * this.setting.margin;
		}
		if (this.setting.autoLoadCount) {
			cavy.maxRequestCount = this.oneRow * this.setting.column;
		}
		this._checkView(true);
	};
	/**
	 * ビューの表示状況を監視
	 * @private
	 */
	ScrollStage.prototype._checkView = function(isRefresh,visibleOnly) {
		this._scroll();
		if (this.wrap.children.length === 0) {return;}
		var x = Math.floor(this.wrap.x * -1);
		var y = Math.floor(this.wrap.y * -1);
		var startIndex = 0;
		var endIndex = 0;
		if (isNaN(this.setting.row)) {
			startIndex = Math.floor(y / (this.wrap.children[0].height+this.setting.margin)) * this.setting.column;
			endIndex = startIndex + this.setting.column * this.oneRow;
		} else {
			startIndex = Math.floor(x / this.width) * this.setting.column * this.oneRow;
			endIndex = startIndex + this.setting.column * this.oneRow * 3;
		}
		if (startIndex < 0) {
			startIndex = 0;
		}
		var l = this.inviews.length;
		while(l--) {
			var c = this.inviews[l];
			var i = c.index;
			if (i < startIndex || i > endIndex) {
				c.content.unload();
			}
		}
		this.inviews = [];
		l = this.wrap.children.length - 1;
		for (var i = startIndex; i < endIndex; i++) {
			if (i > l) {break;}
			var c = this.wrap.children[i];
			if (visibleOnly) {
				c.visible = true;
			} else {
				c.load();
			}
			if (isRefresh) {
				c.refresh();
			}
			this.inviews.push({
				index: i,
				content: c
			});
		}
	};
	/**
	 * スクロールバーのスクロール処理
	 * @private
	 */
	ScrollStage.prototype._scroll = function() {
		if (!this.setting.scrollbar) {return;}
		var sw = (this.width / this.wrap.width);
		var sh = (this.height / this.wrap.height);
		if (sw >= 1) {
			this.scrollbarX.visible = false;
		} else {
			this.scrollbarX.visible = true;
			this.scrollbarX.width = sw * this.width;
		}

		if (sh >= 1) {
			this.scrollbarY.visible = false;
		} else {
			this.scrollbarY.visible = true;
			this.scrollbarY.height = sh * this.height;
		}
		this.scrollbarX.x = -(this.width-this.setting.x) * this.wrap.x / this.width * sw;
		this.scrollbarY.y = -(this.height-this.setting.y) * this.wrap.y / this.height * sh;
	};
	/**
	 * コンテンツデータを変更する
	 * @param data
	 */
	ScrollStage.prototype.setData = function(data) {
		this.data = data;
		this.wrap.removeAllChildren();
		for(var i = 0, len = this.data.length; i < len; i++) {
			this._setContent(this.data[i],i);
			this.wrap.addChild(this.data[i]);
		}
		this.wrap.x = this.wrap.y = 0;
		this.refresh();
	};
	cavy.ScrollStage = ScrollStage;

	/**
	 * スクロールコンテンツクラス
	 * これを継承してScrollContainerに渡す
	 * @param src
	 * @param defaultImg
	 * @param option
	 * @constructor
	 */
	var ScrollContent = function(src,defaultImg,option) {
		this.img = defaultImg;
		cavy.Sprite.apply(this,[this.img,option]);
		this.src = src;
		this.loaded = false;

		this.tempImg;
		if (this.src) {
			this.tempImg = new Image();
		}

		var self = this;
		this._loadedHandler = function(e) {
			self._loaded(this);
		};
		this._errorHandler = function(e){
			self._error(this);
		}
	};
	ScrollContent.prototype = Object.create(cavy.Sprite.prototype);
	ScrollContent.prototype.constructor = ScrollContent;
	/**
	 * アイコン画像の読み込みを停止
	 * レンダリング対象から外れた時にScrollContainerからコールされます
	 */
	ScrollContent.prototype.unload = function() {
		this.visible = false;
		if (this.isLoading) {
			cavy.requestCount--;
			this.tempImg.removeEventListener("load", this._loadedHandler);
			this.tempImg.removeEventListener("error", this._errorHandler);
			this.tempImg.src = "";
		}
		this.isLoading = false;
		this.trigger("unload");
	};
	/**
	 * アイコン画像の読み込みを開始
	 * レンダリング対象になっている時にScrollContainerからコールされます
	 */
	ScrollContent.prototype.load = function() {
		this.visible = true;
		if (!this.src) {return;}
		if (!this.loaded && !this.isLoading && cavy.requestCount < cavy.maxRequestCount) {
			cavy.requestCount++;
			this.isLoading = true;
			this.tempImg.src = this.src;
			if(this.tempImg.complete) {
				this._loaded(this.tempImg);
			} else {
				this.tempImg.addEventListener("load",this._loadedHandler);
				this.tempImg.addEventListener("error",this._errorHandler);
			}
		}
		this.trigger("load");
	};
	/**
	 * アイコン画像の読み込みを開始
	 * レンダリング対象になっている時にScrollContainerからコールされます
	 */
	ScrollContent.prototype.refresh = function() {
		this.trigger("refresh");
	};
	/**
	 * 要素のサイズに変更が発生した時にScrollContainerからコールされます。
	 */
	ScrollContent.prototype.onChange = function() {
		this.trigger("resize");
	};
	/**
	 * 画像が読み込み終わった時の処理
	 * @param img
	 * @private
	 */
	ScrollContent.prototype._loaded = function(img) {
		cavy.requestCount--;
		this.loaded = true;
		this.isLoading = false;
		img.removeEventListener("load",this._loadedHandler);
		this.source = img;
		this.tempImg = null;
		this.trigger("complete");
	};
	/**
	 * 画像の読み込みに失敗した時の処理
	 * @param img
	 * @private
	 */
	ScrollContent.prototype._error = function(img) {
		cavy.requestCount--;
		this.loaded = true;
		this.isLoading = false;
		img.removeEventListener("error",this._errorHandler);
		this.source = null;
		this.tempImg = null;
		this.trigger("error");
	};
	cavy.ScrollContent = ScrollContent;
})(window);