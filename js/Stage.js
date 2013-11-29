(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * Stageオブジェクトクラス
	 * @constructor
	 * @alias cavy.Stage
	 * @augments cavy.DisplayObject
	 * @param container {HTMLElement} canvasを出力するHTML要素
	 * @param width {Number} canvas横幅
	 * @param height {Number} canvas高さ
	 * @param interactive {Boolean} イベントを発行するかどうか
	 * @param strictEvent {Boolean} interactiveがtrueのときにイベント発行範囲を要素の形に厳密に合わせる
	 **/
	var Stage = function (container, width, height, interactive, strictEvent) {
		/**
		 * canvasを出力している親要素
		 * @public
		 * @return {HTMLElement}     
		 */
		this.container = container;
		if (typeof this.container === "string") {
			this.container = document.getElementById(this.container);
		}
		if (this.container === null) {
			return;
		}
		/**
		 * 描画しているcanvas要素 * @public
		 * @return {Canvas|null}
		 */
		this.canvas = document.createElement("canvas");
		/**     * canvasのcontext
		 * @public
		 * @return {Context}
		 */
		this.context = null;
		/**
		 * レンダリング用タイマーID
		 * @private
		 * @return {String|null}
		 */
		this.rendering = null;
		/**
		 * レンダリング毎に実行する処理
		 * @private
		 * @return {Function|null}
		 */
		this.tick = null;
		/**
		 * イベントを発行するかどうか
		 * @type {boolean}
		 */
		this.interactive = interactive ? true : false;

		/**
		 * イベントの発行を厳密に行うかどうか
		 * この設定をtrueにするとイベント発行位置が画像の形あわせて行われます。（パフォーマンスと引き換え
		 * @type {boolean}
		 */
		this.strictEvent = strictEvent ? true : false;

		var self = this;
		this._loopHandler = function (t) {
			self.update(t);
		};
		this._triggerHandler = function (e) {
			self._triggerEvent(e);
		};
		this._refreshHandler = function () {
			self._refresh();
		};
		this._initialize(width, height);
	};
	Stage.prototype = Object.create(cavy.InteractiveObject.prototype);
	Stage.prototype.constructor = Stage;
	/**
	 * 初期化
	 * @private
	 * @param width {Number}
	 * @param height {Number}
	 * @return {void}
	 */
	Stage.prototype._initialize = function (width, height) {
		this.width = width || 320;
		this.height = height || 240;
		this.context = this.canvas.getContext("2d");
		
		this.container.style.overflow = "hidden";
		this.container.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
		this.container.style.tapHighlightColor = "rgba(0,0,0,0)";
		this.container.style.width = width + "px";
		this.container.style.height = height + "px";
		
		var style = this.canvas.style;
		//Androidバグ対応 #transparentにすると１コマで消えちゃう
		if (!style.backgroundColor && cavy.isBuggyDevice("background")) {
			style.backgroundColor = cavy.backgroundColor;
		}
		if (cavy.retina) {
			style.width = this.width + "px";
			style.height = this.height + "px";
			
			cavy.deviceRatio = window.webkitDevicePixelRatio || window.devicePixelRatio || 1;
			this.width *= cavy.deviceRatio;
			this.height *= cavy.deviceRatio;
			this.context.scale(cavy.deviceRatio,cavy.deviceRatio);
		}
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		
		if (this.interactive) {
			this.container.addEventListener("touchstart", this._triggerHandler);
			this.container.addEventListener("touchmove", this._triggerHandler);
			this.container.addEventListener("touchend", this._triggerHandler);
			this.container.addEventListener("gesturestart", this._triggerHandler);
			this.container.addEventListener("gesturechange", this._triggerHandler);
			this.container.addEventListener("gestureend", this._triggerHandler);
			this.container.addEventListener("click", this._triggerHandler);
		}
		this.container.appendChild(this.canvas);
		cavy.InteractiveObject.apply(this, [this.canvas]);
	};
	/**
	 * canvasをクリア
	 * @public
	 * @return {void}
	 */
	Stage.prototype.clear = function () {
		this.clearCanvas(this.context, this.canvas.width, this.canvas.height);
		this.canvas.width = this.canvas.width;
		this.context.scale(cavy.deviceRatio,cavy.deviceRatio);
	};
	/**
	 * canvasのレンダリング開始
	 * @public
	 * @param tick {Function} レンダリング毎に実行する処理(省略可)
	 * @return {void}
	 */
	Stage.prototype.startRender = function (tick) {
		this.stopRender();
		this.tick = tick;
		this.rendering = cavy.Timer.repeat(this._loopHandler);
	};
	/**
	 * canvasのレンダリング停止
	 * @public
	 * @return {void}
	 */
	Stage.prototype.stopRender = function () {
		if (this.rendering) {
			this.rendering.stop();
			this.rendering = null;
		}
	};
	/**
	 * 渡したDisplayObjectをcanvasに描画
	 * @public
	 * @param s {DisplayObject} 描画したいDisplayObject
	 * @return {void}
	 */
	Stage.prototype.render = function (s) {
		this.context.save();
		s.draw(this.context);
		this.context.restore();
	};
	/**
	 * canvasを更新
	 * @public
	 * @param t {Number} 更新時間
	 * @return {void}
	 */
	Stage.prototype.update = function (t) {
		this.tick ? this.tick(t || 0) : 0 ;
		this.clear();
		this._render(this.children);
	};
	/**
	 * canvasを破棄
	 * @public
	 * @return {void}
	 */
	Stage.prototype.destroy = function () {
		this.children = [];
		if (this.interactive) {
			this.container.removeEventListener("touchstart", this._triggerHandler);
			this.container.removeEventListener("touchmove", this._triggerHandler);
			this.container.removeEventListener("touchend", this._triggerHandler);
			this.container.removeEventListener("gesturestart", this._triggerHandler);
			this.container.removeEventListener("gesturechange", this._triggerHandler);
			this.container.removeEventListener("gestureend", this._triggerHandler);
			this.container.removeEventListener("click", this._triggerHandler);
		}
		this.stopRender();
		this.clear();
		this.container.removeChild(this.canvas);
		this.context = this.canvas = null;
		this.container = null;
	};
	/**
	 * 子要素を描画
	 * @private
	 * @param children {Array} 子要素配列
	 * @return {void}
	 */
	Stage.prototype._render = function (children) {
		var c = children.slice(0),
			i = 0,
			l = c.length,
			outRender = cavy.outOfRendering;//,
			//useFilter = cavy.useFilter;
		for (; i < l; i++) {
			var s = c[i];
			if (!s.visible) {
				continue;
			}
			
			if (!outRender) {
				var rect = s.getBoundingRect(),
					hw = this.width / 2,
					hh = this.height / 2;
				if (rect.bottom < -hh || rect.right < -hw || rect.top > this.height + hh || rect.left > this.width + hw) {
					s._visible = false;
					continue;
				} else {
					s._visible = true;
				}
			}
			/*
			if (useFilter) {
				var sl = s.children.length;
				while (sl--) {
					if (s.children[sl].filter !== null) {
						s.createCache();
						break;
					}
				}
			}
			*/
			this.render(s);
			if (s.children.length !== 0 && !s.cache) {
				this._render(s.children);
			}
		}
	};
	/**
	 * イベントを発火
	 * @private
	 * @param e {Object} イベントオブジェクト
	 * @return {void}
	 */
	Stage.prototype._triggerEvent = function (e) {
		var t = e.touches,
			et = e.changedTouches,
			x = (t && t[0]) ? t[0].pageX : e.pageX,
			y = (t && t[0]) ? t[0].pageY : e.pageY;
		if (!x && et) {
			x = et[0].pageX;
		}
		if (!y && e.changedTouches) {
			y = et[0].pageY;
		}
		x -= document.body.scrollLeft;
		y -= document.body.scrollTop;
		var bounds = this.canvas.getBoundingClientRect();
		this._trigger(e, x - bounds.left, y - bounds.top, this.children);
		if (this.hasEvent(e.type)) {
			this.dispatchEvent(e.type, e);
		}
	};
	/**
	 * イベントを発火
	 * @private
	 * @param e {Object} イベントオブジェクト
	 * @param x {Number} イベントが発生したx座標
	 * @param y {Number} イベントが発生したy座標
	 * @param children {Array} 子要素配列
	 * @return {void}
	 */
	Stage.prototype._trigger = function (e, x, y, children) {
		if (!children) {
			return;
		}
		var c = children.slice(),
			l = c.length;
		while (l--) {
			var s = c[l];
			if (!s || !s.visible || !s._visible || !s.interactive) {
				continue;
			}
			if (s.children.length !== 0) {
				this._trigger(e, x, y, s.children);
			}
			if (s._interactive && s.hasEvent(e.type) && s.hitTest(x, y, this.strictEvent)) {
				s.dispatchEvent(e.type, e);
				if (e.returnValue === false) {
					break;
				}
			}
		}
	};
	cavy.Stage = Stage;
})(window);