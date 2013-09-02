/**
 * @fileOverview Stage
 * @version 0.0.1
 **/
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
		 * 描画しているcanvas要素
		 * @public
		 * @return {Canvas|null}
		 */
		this.canvas = (this.container instanceof HTMLCanvasElement) ? this.container : null;
		/**
		 * canvasのcontext
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
		if (cavy.autoRetina) {
			if (window.devicePixelRatio !== 1) {
				cavy.retina = true;
				cavy.deviceRatio = window.devicePixelRatio;
			} else {
				cavy.retina = false;
			}
		} else if(cavy.retina) {
			cavy.deviceRatio = 2;
		}

		this.width = width || 320;
		this.height = height || 240;

		if (cavy.retina) {
			this.width *= cavy.deviceRatio;
			this.height *= cavy.deviceRatio;
		}

		var hasCanvas = true;
		if (!this.canvas) {
			this.canvas = document.createElement("canvas");
			hasCanvas = false;
		} else {
			this.container = this.canvas.parentNode;
		}
		this.container.style.overflow = "hidden";
		this.container.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
		this.container.style.tapHighlightColor = "rgba(0,0,0,0)";
		var style = this.canvas.style;
		if (!style.backgroundColor && cavy.isBuggyDevice("background")) {
			style.backgroundColor = cavy.backgroundColor;
		}

		this.canvas.width = this.width;
		this.canvas.height = this.height;

		this.context = this.canvas.getContext("2d");
		if (cavy.retina) {
			style.width = this.width / cavy.deviceRatio + "px";
			style.height = this.height / cavy.deviceRatio + "px";
			this.context.scale(cavy.deviceRatio, cavy.deviceRatio);
		}
		if (this.interactive) {
			this.canvas.addEventListener("touchstart", this._triggerHandler);
			this.canvas.addEventListener("touchmove", this._triggerHandler);
			this.canvas.addEventListener("touchend", this._triggerHandler);
			this.canvas.addEventListener("gesturestart", this._triggerHandler);
			this.canvas.addEventListener("gesturechange", this._triggerHandler);
			this.canvas.addEventListener("gestureend", this._triggerHandler);
			this.canvas.addEventListener("click", this._triggerHandler);
		}
		if (hasCanvas === false) {
			this.container.appendChild(this.canvas);
		}
		cavy.InteractiveObject.apply(this, [this.canvas]);
		this.clear();
	};
	/**
	 * canvasをクリア
	 * @public
	 * @return {void}
	 */
	Stage.prototype.clear = function () {
		if (this.context){
			this.clearCanvas(this.context,this.canvas.width,this.canvas.height);
		}
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
		this.update();
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
		}
		this.rendering = this.tick = null;
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
		if (this.tick) { this.tick(t);}
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
			this.canvas.removeEventListener("touchstart", this._triggerHandler);
			this.canvas.removeEventListener("touchmove", this._triggerHandler);
			this.canvas.removeEventListener("touchend", this._triggerHandler);
			this.canvas.removeEventListener("gesturestart", this._triggerHandler);
			this.canvas.removeEventListener("gesturechange", this._triggerHandler);
			this.canvas.removeEventListener("gestureend", this._triggerHandler);
			this.canvas.removeEventListener("click", this._triggerHandler);
		}
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
			l = c.length;
		for (; i < l; i++) {
			var s = c[i];
			if (!cavy.outOfRendering) {
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
			if (!s.visible) {continue;}
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
			rect = this.canvas.getBoundingClientRect(),
			x = (t && t[0]) ? t[0].pageX : e.pageX,
			y = (t && t[0]) ? t[0].pageY : e.pageY;
		if (!x && et) {
			x = et[0].pageX;
		}
		if (!y && e.changedTouches) {
			y = et[0].pageY;
		}
		this._trigger(e, x - rect.left, y - rect.top, this.children);
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
		if (!children) {return;}
		var c = children.slice(),
			l = c.length;
		while (l--) {
			var s = c[l];
			if (!s) { continue;}
			if (s.children.length !== 0) {
				this._trigger(e, x, y, s.children);
			}
			if (s.visible && s._visible && s.hasEvent(e.type) && s.hitTest(x, y, this.strictEvent)) {
				s.dispatchEvent(e.type, e);
				if (e.returnValue === false) { break; }
			}
		}
	};
	cavy.Stage = Stage;
})(window);
