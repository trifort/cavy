(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * トゥイーンクラス
	 * @constructor
	 * @alias cavy.Tween
	 * @example
	 *  var t = Tween(sprite);
	 *  t.to({x:100,y:100},3000,"linear");
	 *  t.wait(1000);
	 *  t.to({x:200,y:50});
	 *  t.to({x:"+200",y:"-40"});
	 *  t.call(function(){});
	 **/
	var Tween = function() {
		var func = this.create;
		func.create = this.create;
		func.remove = this.remove;
		return func;
	};
	Tween.prototype = {
		constructor: Tween,
		/**
		 * TweenObjectを生成
		 * @public
		 * @param sprite {DisplayObject} 動かしたいDisplayObject
		 * @param autoRelease {Boolean} Complete時に自動解放するかどうか
		 * @return {TweenObject}
		 **/
		create: function (sprite, autoRelease) {
			return new TweenObject(sprite, autoRelease || false);
		},
		/**
		 * TweenObjectを削除
		 * @param to {TweenObject}
		 */
		remove: function (to) {
			to.destroy();
		}
	};
	/**
	 * Tweenのデフォルトアニメーション時間
	 * @public
	 * @default 1000
	 **/
	Tween.duration = 1000;
	/**
	 * Tweenのデフォルトイージング関数
	 * @public
	 * @default "easeOutQuad"
	 **/
	Tween.easing = "easeOutQuad";
	
	var TweenEasing = {
		linear: function (t, b, c, d) {
			return c * t / d + b;
		},
		easeInQuad: function (t, b, c, d) {
			return c * (t /= d) * t + b;
		},
		easeOutQuad: function (t, b, c, d) {
			return -c * (t /= d) * (t - 2) + b;
		},
		easeInOutQuad: function (t, b, c, d) {
			if ((t /= d / 2) < 1) return c / 2 * t * t + b;
			return -c / 2 * ((--t) * (t - 2) - 1) + b;
		},
		easeInCubic: function (t, b, c, d) {
			return c * (t /= d) * t * t + b;
		},
		easeOutCubic: function (t, b, c, d) {
			return c * ((t = t / d - 1) * t * t + 1) + b;
		},
		easeInOutCubic: function (t, b, c, d) {
			if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
			return c / 2 * ((t -= 2) * t * t + 2) + b;
		},
		easeInQuart: function (t, b, c, d) {
			return c * (t /= d) * t * t * t + b;
		},
		easeOutQuart: function (t, b, c, d) {
			return -c * ((t = t / d - 1) * t * t * t - 1) + b;
		},
		easeInOutQuart: function (t, b, c, d) {
			if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
			return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
		},
		easeInQuint: function (t, b, c, d) {
			return c * (t /= d) * t * t * t * t + b;
		},
		easeOutQuint: function (t, b, c, d) {
			return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
		},
		easeInOutQuint: function (t, b, c, d) {
			if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
			return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
		},
		easeInSine: function (t, b, c, d) {
			return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
		},
		easeOutSine: function (t, b, c, d) {
			return c * Math.sin(t / d * (Math.PI / 2)) + b;
		},
		easeInOutSine: function (t, b, c, d) {
			return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
		},
		easeInExpo: function (t, b, c, d) {
			return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
		},
		easeOutExpo: function (t, b, c, d) {
			return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
		},
		easeInOutExpo: function (t, b, c, d) {
			if (t == 0) return b;
			if (t == d) return b + c;
			if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
			return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
		},
		easeInCirc: function (t, b, c, d) {
			return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
		},
		easeOutCirc: function (t, b, c, d) {
			return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
		},
		easeInOutCirc: function (t, b, c, d) {
			if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
			return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
		},
		easeInElastic: function (t, b, c, d) {
			var s = 1.70158;
			var p = 0;
			var a = c;
			if (t == 0) return b;
			if ((t /= d) == 1) return b + c;
			if (!p) p = d * .3;
			if (a < Math.abs(c)) {
				a = c;
				var s = p / 4;
			}
			else var s = p / (2 * Math.PI) * Math.asin(c / a);
			return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
		},
		easeOutElastic: function (t, b, c, d) {
			var s = 1.70158;
			var p = 0;
			var a = c;
			if (t == 0) return b;
			if ((t /= d) == 1) return b + c;
			if (!p) p = d * .3;
			if (a < Math.abs(c)) {
				a = c;
				var s = p / 4;
			}
			else var s = p / (2 * Math.PI) * Math.asin(c / a);
			return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
		},
		easeInOutElastic: function (t, b, c, d) {
			var s = 1.70158;
			var p = 0;
			var a = c;
			if (t == 0) return b;
			if ((t /= d / 2) == 2) return b + c;
			if (!p) p = d * (.3 * 1.5);
			if (a < Math.abs(c)) {
				a = c;
				var s = p / 4;
			}
			else var s = p / (2 * Math.PI) * Math.asin(c / a);
			if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
			return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
		},
		easeInBack: function (t, b, c, d, s) {
			if (s == undefined) s = 1.70158;
			return c * (t /= d) * t * ((s + 1) * t - s) + b;
		},
		easeOutBack: function (t, b, c, d, s) {
			if (s == undefined) s = 1.70158;
			return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
		},
		easeInOutBack: function (t, b, c, d, s) {
			if (s == undefined) s = 1.70158;
			if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
			return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
		},
		easeInBounce: function (t, b, c, d) {
			return c - Tween.Easing.easeOutBounce(d - t, 0, c, d) + b;
		},
		easeOutBounce: function (t, b, c, d) {
			if ((t /= d) < (1 / 2.75)) {
				return c * (7.5625 * t * t) + b;
			} else if (t < (2 / 2.75)) {
				return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
			} else if (t < (2.5 / 2.75)) {
				return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
			} else {
				return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
			}
		},
		easeInOutBounce: function (t, b, c, d) {
			if (t < d / 2) return Tween.Easing.easeInBounce(t * 2, 0, c, d) * .5 + b;
			return Tween.Easing.easeOutBounce(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
		}
	};

	/**
	 * Tweenイージング関数群
	 * @public
	 **/
	Tween.Easing = TweenEasing;

	/**
	 * トゥイーンオブジェクト
	 * @constructor
	 * @alias cavy.TweenObject
	 * @augments cavy.EventDispatcher
	 **/
	var TweenObject = function (sprite, autoRelease) {
		cavy.EventDispatcher.apply(this);
		this.sprite = sprite;
		this.autoRelease = autoRelease;
		/**
		 * アニメーションタスク
		 * @private
		 **/
		this.__attach__ = [];
		/**
		 * タスクインデックス
		 * @private
		 **/
		this.index = 0;
		/**
		 * アニメーション中かどうか
		 * @public
		 **/
		this.isPlaying = false;
		/**
		 * 繰り返しするかどうか
		 * @public
		 **/
		this.isRepeat = false;
		/**
		 * 逆再生状態かどうか
		 * @public
		 **/
		this.reverse = false;
		this.isReset = false;
		this.time = 0;
		this.stepCallback = null;
		var self = this;
		this._loopHandler = function () {
			self.update();
		};
	};
	TweenObject.prototype = Object.create(cavy.EventDispatcher.prototype);
	TweenObject.prototype.constructor = TweenObject;
	/**
	 * アニメーションの追加
	 * @public
	 * @param param {Object} アニメーション先のパラメータ
	 * @return {TweenObject}
	 * @example
	 *  var t = cavy.Tween(sprite).to({x:100,y:100});
	 **/
	TweenObject.prototype.to = function (param) {
		var args = Array.prototype.slice.apply(arguments);
		param = args.shift();
		var q = new TweenQueue(param, args);
		this.__attach__.push(q);
		if (!this.isPlaying) {
			q.initialize(this.sprite);
			this.play();
		}
		return this;
	};
	/**
	 * 要素に即パラメータを設定
	 * @public
	 * @param param {Object} パラメータ
	 * @return {TweenObject}
	 * @example
	 *  var t = cavy.Tween(sprite).set({x:100,y:100});
	 **/
	TweenObject.prototype.set = function (param) {
		var q = new ParamQueue(param);
		this.__attach__.push(q);
		if (!this.isPlaying) {
			q.initialize(this.sprite);
			this.play();
		}
		return this;
	};
	/**
	 * アニメーションの待機時間を追加
	 * @public
	 * @param time {Number} 待機時間
	 * @return {TweenObject}
	 * @example
	 *  var t = cavy.Tween(sprite).wait(1000).to({x:100,y:100});
	 **/
	TweenObject.prototype.wait = function (time) {
		var q = new WaitQueue(time);
		if (q.frame !== 0) {
			this.__attach__.push(q);
			if (!this.isPlaying) {
				q.initialize();
				this.play();
			}
		}
		return this;
	};
	/**
	 * 関数を実行
	 * @public
	 * @param callback {Function} 実行関数
	 * @return {TweenObject}
	 * @example
	 *  var t = cavy.Tween(sprite).wait(1000).call(function(){alert("hoge")});
	 **/
	TweenObject.prototype.call = function (callback) {
		var q = new CallQueue(callback);
		this.__attach__.push(q);
		if (!this.isPlaying) {
			q.initialize();
			this.play();
		}
		return this;
	};
	/**
	 * アニメーションの完了時に行う処理
	 * @public
	 * @param callback {Function} 完了時に行う処理
	 * @return {TweenObject}
	 * @deprecated call関数を使用してください
	 * @example
	 *  var t = cavy.Tween(sprite).to({x:100,y:100}).complete(function(){});
	 **/
	TweenObject.prototype.complete = function (callback) {
		var completeFunction = function () {
			this.removeEventListener("complete", completeFunction);
			callback.apply(this, [arguments]);
		};
		this.addEventListener("complete", completeFunction);
		return this;
	};
	/**
	 * アニメーションを繰り返す
	 * @public
	 * @return {TweenObject}
	 * @example
	 *  var t = cavy.Tween(sprite).to({x:100,y:100}).repeat();
	 **/
	TweenObject.prototype.repeat = function (reset, limit) {
		this.isRepeat = true;
		if (typeof reset === "number") {
			this.isReset = false;
			this.limit = reset * 2;
			return this;
		}
		this.isReset = reset || false;
		if (typeof limit === "number") {
			this.limit = limit;
			if (!this.isReset) {
				this.limit *= 2;
			}
		}
		return this;
	};
	/**
	 * 次タスクを実行
	 * @private
	 **/
	TweenObject.prototype._doAttach = function () {
		this.reverse ?  --this.index : ++this.index;
		var q = this.__attach__[this.index];
		q.initialize(this.sprite, this.reverse, this.isReset);
		this.time = Date.now();
	};
	/**
	 * 次タスクがあるかどうか
	 * @private
	 * @return {Boolean} 次タスクがあればtrue
	 **/
	TweenObject.prototype._hasAttach = function () {
		var l = this.__attach__.length;
		if (l === 0) return false;
		if (this.reverse) {
			if (this.index !== 0) return true;
		} else {
			if (this.index !== l - 1) return true;
		}
		return false;
	};
	/**
	 * アニメーション開始
	 * @public
	 * @return {TweenObject}
	 **/
	TweenObject.prototype.play = function () {
		if (!this.isPlaying) {
			this.stop();
			this.time = Date.now();
			this.isPlaying = true;
			this.timer = cavy.Timer.repeat(this._loopHandler);
		}
		return this;
	};
	/**
	 * アニメーション停止
	 * @public
	 * @return {TweenObject}
	 **/
	TweenObject.prototype.stop = function () {
		this.isPlaying = false;
		if (this.timer) {
			this.timer.stop();
		}
		return this;
	};
	/**
	 * アニメーション設定をリセット
	 * @public
	 * @return {TweenObject}
	 **/
	TweenObject.prototype.reset = function () {
		this.stop();
		this.index = 0;
		this.isReset = false;
		this.isRepeat = false;
		this.__attach__ = [];
		return this;
	};
	/**
	 * アニメーションを更新
	 * @public
	 * @return {void}
	 **/
	TweenObject.prototype.update = function () {
		if (!this.sprite || !this.sprite.parent) {
			this.stop();
			return;
		}
		var q = this.__attach__[this.index];
		if (cavy.strict) {
			var now = Date.now(),
				f = (now - this.time) / q.time * q.frame;
			if (f - q.count > cavy.maxSkip) {
				f = q.count + cavy.maxSkip;
			}
			q.count = Math.min(~~f, q.frame);
		}
		var easing = Tween.Easing[q.easing];
		if (q.count === q.frame) {
			for (var key in q.end) {
				this.sprite[key] = q.end[key];
			}
			if (this._hasAttach()) {
				this._doAttach();
			} else if (this.isRepeat) {
				if (!isNaN(this.limit)) {
					--this.limit;
					if (this.limit <= 0) {
						this.stop();
						this.dispatchEvent("complete", this, this.sprite);
						this.limit = null;
						return;
					}
				}
				if (this.isReset) {
					this.index = -1;
				} else {
					if (this.reverse) {
						this.reverse = false;
						this.index = -1;
					} else {
						this.reverse = true;
						this.index = this.__attach__.length;
					}
				}
				this._doAttach();
			} else {
				this.stop();
				this.dispatchEvent("complete", this, this.sprite);
				if (this.autoRelease) {
					this.destroy();
				}
				return;
			}
		} else if (q.QUEUE_TYPE === "tween") {
			for (var key in q.end) {
				var s = q.start[key],
					e = q.end[key];
				this.sprite[key] = easing(q.count,s, e - s, q.frame - 1);
			}
			if (cavy.strict) {q.count++};
		} else if (q.QUEUE_TYPE === "wait") {
			if (cavy.strict) {q.count++};
		}
		if (this.stepCallback) {
			this.stepCallback.apply(this);
		}
	};
	/**
	 * TweenObjectを破棄
	 * @public
	 * @return {void}
	 **/
	TweenObject.prototype.destroy = function () {
		this.stop();
		this.stepCallback = null;
		this.removeEventListener();
		this.__attach__ = [];
		this.sprite = null;
	};
	/**
	 * アニメーション描画毎に実行する処理を設定
	 * @public
	 * @return {void}
	 **/
	TweenObject.prototype.step = function (callback) {
		this.stepCallback = callback;
		return this;
	};

	/**
	 * トゥイーンキュークラス
	 * @constructor
	 * @private
	 * @class TweenQueue
	 * @param param {Object}
	 * @param option {Object}
	 **/
	var TweenQueue = function (param, option) {
		this.setting = {
			duration: Tween.duration,
			easing: Tween.easing
		};
		this.start = null;
		this.end = param;
		if (option) {
			var l = option.length;
			while (l--) {
				var o = option[l];
				if (typeof o === "object") {
					for (var key in o) {
						this.setting[key] = o[key];
					}
				} else if (typeof o === "string") {
					this.setting.easing = o;
				} else if (typeof o === "number") {
					this.setting.duration = o;
				}
			}
		}
		this.SECOND = 1000;
		this.time = this.setting.duration;
		this.easing = this.setting.easing;
		this.count = 0;
		this.frame = Math.round(this.time / (this.SECOND / cavy.frameRate));
	};
	TweenQueue.prototype = {
		constructor: TweenQueue,
		QUEUE_TYPE: "tween",
		/**
		 * 初期化
		 * @private
		 * @param sprite {DisplayObject} DisplayObject
		 * @param reverse {Booelan} リバース状態かどうか
		 * @return {void}
		 **/
		initialize: function (sprite, reverse, reset) {
			this.count = 0;
			if (reverse) {
				var temp = this.start;
				this.start = this.end;
				this.end = temp;
			} else if (this.start && !reset) {
				var temp = this.start;
				this.start = this.end;
				this.end = temp;
			} else {
				this.start = this.extend(this.end, sprite);
				this.checkRelative(this.end);
			}
		},
		/**
		 * 相対移動かどうか
		 * @private
		 * @param target {Object}
		 * @return {void}
		 **/
		checkRelative: function (target) {
			for (var key in target) {
				var v = target[key];
				if (typeof v === "string" && v.search(/\+=|-=/) !== -1) {
					v = parseFloat(v.replace(/=/, ""));
					target[key] = v + this.start[key];
				}
			}
		},
		/**
		 * 要素パラメータを取得
		 * @private
		 * @param base {Object}
		 * @param obj {Object}
		 * @return {Object} 取得したパラメータ
		 **/
		extend: function (base, obj) {
			var result = {};
			for (var key in base) {
				result[key] = obj[key];
			}
			return result;
		}
	};
	/**
	 * パラメーターキュークラス
	 * @constructor
	 * @private
	 * @class ParamQueue
	 * @param {Object} param
	 **/
	var ParamQueue = function (param) {
		this.param = param;
		this.count = this.frame = 0;
	};
	ParamQueue.prototype = {
		constructor: ParamQueue,
		QUEUE_TYPE: "param",
		initialize: function (sprite) {
			this.count = this.frame = 0;
			for (var key in this.param) {
				sprite[key] = this.param[key];
			}
		}
	};
	/**
	 * コールキュークラス
	 * @constructor
	 * @private
	 * @class ParamQueue
	 * @param param {Object}
	 **/
	var CallQueue = function (callback) {
		this.callback = callback;
		this.count = this.frame = 0;
	};
	CallQueue.prototype = {
		constructor: CallQueue,
		QUEUE_TYPE: "call",
		initialize: function (sprite) {
			this.count = this.frame = 0;
			this.callback.apply(sprite);
		}
	};
	/**
	 * ウェイトキュークラス
	 * @constructor
	 * @private
	 * @class ParamQueue
	 * @param time {Number}
	 **/
	var WaitQueue = function (time) {
		this.time = time;
		this.count = 0;
		this.SECOND = 1000;
		this.frame = Math.round(this.time / (this.SECOND / cavy.frameRate));
	};
	WaitQueue.prototype = {
		constructor: WaitQueue,
		QUEUE_TYPE: "wait",
		initialize: function () {
			this.count = 0;
			this.frame = Math.round(this.time / (this.SECOND / cavy.frameRate));
		}
	};
	cavy.Tween = new Tween();
	cavy.TweenEasing = TweenEasing;
	cavy.TweenObject = TweenObject;
})(window);
