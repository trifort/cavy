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
		this.canvas = [];
		/**     * canvasのcontext
		 * @public
		 * @return {Context}
		 */
		this.context = [];
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

		/**
		 * ダブルバッファインデックス
		 * @type {number}
		 */
		this.bufferIndex = 0;

		var self = this;
		this._loopHandler = function (t) {
			self.update(t);
		};
		this._triggerHandler = function (e) {
			self._triggerEvent(e);
		};
		this._initialize(width, height);
	};
	var p = Stage.prototype = Object.create(cavy.InteractiveObject.prototype);
	var HOOK_EVENT = [
		"touchstart",
		"touchmove",
		"touchend",
		"gesturestart",
		"gesturechange",
		"gestureend",
		"click"
	];
	p.constructor = Stage;
	/**
	 * 初期化
	 * @private
	 * @param width {Number}
	 * @param height {Number}
	 * @return {void}
	 */
	p._initialize = function (width, height) {
		var i = 0,
			len = 0;
		this.width = width || 320;
		this.height = height || 240;
		this.container.style.position = "relative";
		this.container.style.overflow = "hidden";
		this.container.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
		this.container.style.tapHighlightColor = "rgba(0,0,0,0)";
		this.container.style.width = width + "px";
		this.container.style.height = height + "px";
		
		this.canvas[0] = document.createElement("canvas");
		if (cavy.doubleBuffering) {
			this.canvas[1] = document.createElement("canvas");
		}
		for (i = 0,len = this.canvas.length; i < this.canvas.length; i++) {
			
			var canvas = this.canvas[i],
				style = canvas.style;
			style.position = "absolute";
			style.top = 0;
			style.left = 0;
			if (cavy.doubleBuffering) {
				style.visibility = "hidden";
			}
			this.context[i] = this.canvas[i].getContext("2d");
			if (cavy.retina) {
				cavy.deviceRatio = window.webkitDevicePixelRatio || window.devicePixelRatio || 1;
				style.width = this.width + "px";
				style.height = this.height + "px";
				this.width *= cavy.deviceRatio;
				this.height *= cavy.deviceRatio;
				canvas.width = this.width;
				canvas.height = this.height;
				this.context[i].scale(cavy.deviceRatio,cavy.deviceRatio);
			} else {
				canvas.width = this.width;
				canvas.height = this.height;
			}
			this.container.appendChild(this.canvas[i]);
		}
		
		//Androidバグ対応 #transparentにすると１コマで消えちゃう
		/*
		if (!style.backgroundColor && cavy.isBuggyDevice("background")) {
			style.backgroundColor = cavy.backgroundColor;
		}
		*/
		
		if (this.interactive) {
			for(var i = 0,len=HOOK_EVENT.length; i < len; i++) {
				this.container.addEventListener(HOOK_EVENT[i], this._triggerHandler);
			}
		}
		cavy.InteractiveObject.call(this,this.canvas[0]);
	};
	/**
	 * canvasをクリア
	 * @public
	 * @return {void}
	 */
	p.clear = function () {
		this.context[this.bufferIndex].clearRect(0,0,this.width+1,this.height+1);
		/*
		if (cavy.isBuggyDevice("lag")) {
			this.canvas.width = this.canvas.width;
			this.context.setTransform(cavy.deviceRatio,0,0,cavy.deviceRatio,0,0);
		}
		*/
	};
	/**
	 * canvasのレンダリング開始
	 * @public
	 * @param tick {Function} レンダリング毎に実行する処理(省略可)
	 * @return {void}
	 */
	p.startRender = function (tick) {
		this.stopRender();
		this.tick = tick;
		this.rendering = cavy.Timer.repeat(this._loopHandler);
	};
	/**
	 * canvasのレンダリング停止
	 * @public
	 * @return {void}
	 */
	p.stopRender = function () {
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
	p.render = function (s) {
		this.context[this.bufferIndex].save();
		s.draw(this.context[this.bufferIndex]);
		this.context[this.bufferIndex].restore();
	};
	/**
	 * canvasを更新
	 * @public
	 * @param t {Number} 更新時間
	 * @return {void}
	 */
	p.update = function (t) {
		this.bufferIndex = cavy.doubleBuffering ? 1 - this.bufferIndex : 0;
		this.clear();
		this.tick ? this.tick(t || 0) : 0 ;
		this._render(this.children);
		if (cavy.doubleBuffering) {
			this.canvas[this.bufferIndex].style.visibility = "visible";
			this.canvas[1-this.bufferIndex].style.visibility = "hidden";
		}
	};
	/**
	 * canvasを破棄
	 * @public
	 * @return {void}
	 */
	p.destroy = function () {
		var i = 0,len = 0;
		this.children = [];
		if (this.interactive) {
			for(i = 0,len=HOOK_EVENT.length; i < len; i++) {
				this.container.removeEventListener(HOOK_EVENT[i], this._triggerHandler);
			}
		}
		this.stopRender();
		for (i = 0,len = 0; i < len; i++) {
			this.container.removeChild(this.canvas[i]);
		}
		this.context = this.canvas = [];
		this.container = null;
	};
	/**
	 * 子要素を描画
	 * @private
	 * @param children {Array} 子要素配列
	 * @return {void}
	 */
	p._render = function (children) {
		var i = 0,
			c = children.slice(),
			l = c.length,
			outRender = cavy.outOfRendering,
			useFilter = cavy.useFilter;
		for (; i < l; i++) {
			var s = c[i];
			if (!s || !s.visible) {
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
			if (useFilter && s.parent) {
				var sl = s.children.length;
				while (sl--) {
					if (s.children[sl].filter !== null) {
						s.createCache();
						break;
					}
				}
			}
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
	p._triggerEvent = function (e) {
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
		var bounds = this.canvas[this.bufferIndex].getBoundingClientRect();
		
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
	p._trigger = function (e, x, y, children) {
		var l = children.length;
		var c = children.slice();
		while (l--) {
			var s = c[l];
			if (!s || !s.visible || !s._visible || !s.interactive) {
				continue;
			}
			if (s.children.length !== 0) {
				this._trigger(e, x, y, s.children);
			}
			if (s.hasEvent(e.type) && s.hitTest(x, y, this.strictEvent)) {
				s.dispatchEvent(e.type, e);
				if (e.returnValue === false) {
					break;
				}
			}
		}
	};
	cavy.Stage = Stage;
})(window);