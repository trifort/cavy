(function (window) {
	"use strict";

	/**
	 * すべてのクラスを内包するネームスペース
	 * @public
	 * @namespace cavy
	 * @type {Object}
	 */
	window.cavy = window.cavy || {};
	/**
	 * userAgent
	 * @public
	 * @default navigator.userAgent
	 * @type {string}
	 */
	cavy.userAgent = navigator.userAgent;
	var isiOS6 = (cavy.userAgent.search(/OS 6/) !== -1);
	window.requestAnimationFrame = (function (window) {
		var timeout = (function () {
			var lastTime = Date.now(),
				startTime = Date.now();
			return function (callback) {
				var currTime = Date.now(),
					timeToCall = Math.max(0, 16 - (currTime - lastTime));
				lastTime = currTime + timeToCall;
				return window.setTimeout(callback, timeToCall, lastTime - startTime)
			}
		})(window);
		if (isiOS6) {
			return timeout;
		} else {
			return window.webkitRequestAnimationFrame || window.requestAnimationFrame || timeout;
		}
	})(window);
	window.cancelAnimationFrame = (function (window) {
		if (isiOS6) {
			return window.clearTimeout;
		} else {
			return window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.clearTimeout;
		}
	})(window);
	
	/**
	 * Retinaディスプレイ対応
	 * @public
	 * @default false
	 * @type {boolean}
	 */
	cavy.retina = false;
	/**
	 * pixelSnap
	 * @public
	 * @default false
	 * @type {boolean}
	 */
	cavy.pixelSnap = false;
	/**
	 * アニメーションフレームを実時間で調整する
	 * @public
	 * @default true
	 * @type {boolean}
	 */
	cavy.strict = true;
	/**
	 * フレームレート
	 * @public
	 * @default 60
	 * @type {number}
	 */
	cavy.frameRate = 60;
	/**
	 * フレームを飛ばす最大値
	 * @public
	 * @default 60
	 * @type {number}
	 */
	cavy.maxSkip = 60;

	/**
	 * deviceRatio
	 * @public
	 * @default 1
	 * @type {number}
	 */
	cavy.deviceRatio = 1;
	/**
	 * バグ種類別にユーザーエージェントを格納するオブジェクト
	 * @private
	 * @type {object}
	 */
	cavy.bugs = {
		//背景色つけないとcanvas消えちゃう
		background: ["F-06E","L-05E","SC-04E"]
	};

	/**
	 * Canvas外描画を行うかどうか
	 * @type {boolean}
	 */
	cavy.outOfRendering = true;

	/**
	 * Filter機能を使うかどうか
	 * @type {boolean}
	 */
	cavy.useFilter = false;

	/**
	 * canvasの背景色（色を何かしらつけないと一部のAndroid端末で描画されないバグがある）
	 * @default "rgba(255,255,255,0.01)"
	 * @type {string}
	 */
	cavy.backgroundColor = "rgba(255,255,255,0.01)";

    /**
     * アクセス端末に指定したバグがあるかどうか
	 * @private
     * @param type {string} バグタイプを表す文字列
     * @returns {boolean}
     */
    cavy.isBuggyDevice = function(type) {
        var bug = cavy.bugs[type];
        if (!bug) { return false; }
        var l = bug.length;
        while(l--) {
            if (cavy.userAgent.search(bug[l]) !== -1) {
                return true;
            }
        }
        return false;
    };
	/**
	 * Retinaディスプレイかどうかを返却
	 * @public
	 * @return {boolean}
	 */
	cavy.isRetina = function() {
		if (window.devicePixelRatio !== 1) {
			return true;
		}
		return false;
	};
	/**
	 * ネームスペースをすべてwindowに書き出す
	 * @public
	 */
	cavy.expand = function () {
		for (var key in this) {
			window[key] = this[key];
		}
	};
})(window);

(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	
	var Util = {
		/**
		 * オブジェクトの複製
		 * @param obj {Object}
		 * @returns {Object}
		 */
		clone: function(obj) {
			return Util.extend({}, obj);
		},
		/**
		 * オブジェクトの継承
		 * @param what {Object} 継承先
		 * @param wit {Object} 継承元
		 * @returns {Object}
		 */
		extend: function(target, source, deep) {
			for (var key in source) {
				if (deep && (this.isPlainObject(source[key]) || this.isArray(source[key]))) {
					if (this.isPlainObject(source[key]) && !this.isPlainObject(target[key])) {
						target[key] = {};
					}
					if (this.isArray(source[key]) && !this.isArray(target[key])) {
						target[key] = [];
						extend(target[key], source[key], deep)
					}
				} else if (source[key] !== undefined) {
					target[key] = source[key];
				}
			}
			return target;
		},
		/**
		 * Objectかどうかの判定
		 * @param obj {*}
		 * @returns {Boolean}
		 */
		isPlainObject: function(obj) {
			return (obj && typeof obj === "object" && obj !== obj.window && Object.getPrototypeOf(obj) === Object.prototype);
		},
		/**
		 * 配列かどうかの判定
		 * @param obj
		 * @returns {boolean}
		 */
		isArray: function(obj) {
			return obj instanceof Array;
		}
	};
	cavy.Util = Util;
})(window);
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * イベントの登録・発火を管理するクラス
	 * @alias cavy.EventDispatcher
	 * @constructor
	 **/
	var EventDispatcher = function () {
		this.__store__ = {};
	};
	EventDispatcher.prototype = {
		constructor: EventDispatcher,
		/**
		 * イベントを登録する
		 * @public
		 * @alias EventDispatcher.on
		 * @param {String} type 追加するイベントタイプ
		 * @param {Function} listener イベント発火時の処理
		 * @return {EventDispatcher}
		 **/
		addEventListener: function (type, listener) {
			return this.on(type, listener);
		},
		/**
		 * イベントを登録する
		 * @public
		 * @param {String} type 追加するイベントタイプ
		 * @param {Function} listener イベント発火時の処理
		 * @return {EventDispatcher}
		 **/
		on: function(type, listener) {
			var typeStore = this.__store__[type] || [];
			typeStore.push(listener);
			this.__store__[type] = typeStore;
			return this;
		},
		/**
		 * イベントを削除する
		 * @public
		 * @alias @alias EventDispatcher.off
		 * @param {String} type 削除するイベントタイプ。省略するとすべてのイベントを削除します。
		 * @param {Function} listener 削除するイベント発火時の処理。省略すると指定イベントタイプのすべての処理を削除します。
		 * @return {EventDispatcher}
		 **/
		removeEventListener: function (type, listener) {
			return this.off(type, listener)
		},
		/**
		 * イベントを削除する
		 * @public
		 * @param {String} type 削除するイベントタイプ。省略するとすべてのイベントを削除します。
		 * @param {Function} listener 削除するイベント発火時の処理。省略すると指定イベントタイプのすべての処理を削除します。
		 * @return {EventDispatcher}
		 **/
		off: function(type, listener) {
			if (!type) {
				this.__store__ = {};
			} else if (typeof listener === "function") {
				var typeStore = this.__store__[type];
				if (typeStore) {
					var index = typeStore.indexOf(listener);
					if (index !== -1) {
						typeStore.splice(index, 1);
						this.__store__[type] = typeStore;
					}
				}
			} else {
				delete this.__store__[type];
			}
			return this;
		},
		/**
		 * イベントが登録されているかどうかを返却
		 * @public
		 * @param {String} type イベントタイプ
		 * @return {Boolean} イベントが登録されているかどうか
		 **/
		hasEvent: function (type) {
			return this.__store__[type] ? true : false;
		},
		/**
		 * 指定したイベントを発火
		 * @public
		 * @alias EventDispatcher.trigger
		 * @param {String} type イベントタイプ
		 * @param {Object} e イベント発火後の処理に渡す引数
		 * @param {Object} thisObj thisに設定するオブジェクト。省略するとEventDispatcherを設定します。
		 * @return {Boolean} イベントが登録されているかどうか
		 **/
		dispatchEvent: function (type, e, thisObj) {
			return this.trigger(type, e, thisObj);
		},
		/**
		 * 指定したイベントを発火
		 * @public
		 * @param {String} type イベントタイプ
		 * @param {Object} e イベント発火後の処理に渡す引数
		 * @param {Object} thisObj thisに設定するオブジェクト。省略するとEventDispatcherを設定します。
		 * @return {Boolean} イベントが登録されているかどうか
		 **/
		trigger: function (type, e, thisObj) {
			var typeStore = this.__store__[type] || null;
			if (typeStore) {
				thisObj = thisObj || this;
				var args = Array.prototype.slice.apply(arguments, [1]);
				var t = typeStore.slice();
				for (var i = 0, len = t.length; i < len; i++) {
					t[i].apply(thisObj, args);
				}
				t = null;
			}
			return this;
		}
	};
	cavy.EventDispatcher = EventDispatcher;
})(window);
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * 画像をプリロードするクラス
	 * @alias cavy.Preload
	 * @constructor
	 * @param data プリロードする画像データ
	 * @param callback 読み込み完了時に実行する処理
	 * @param connection 一度に並列処理する件数(初期値:5)
	 * @example
	 *  var preload = new Preload([{id:"hoge",src:"http://example.jp/img.jpg"},{id:"hoge2",src:"http://example.jp/img2.jpg"}]);
	 *  var preload = new Preload(["http://example.jp/img.jpg","http://example.jp/img2.jpg"]);
	 *  var preload = new Preload({"hoge": "http://example.jp/img.jpg", "hoge2":"http://example.jp/img2.jpg"});
	 *  preload.addEventListener("complete",function(result)) {
	 *		result["hoge"];
	 *		result[0];
	 *		result["hoge2"];
	 *		preload.get("hoge");
	 *	});
	 *  
	 */
	var Preload = function (data, callback, connection) {
		cavy.EventDispatcher.apply(this);
		this.data = data;
		this.keys = [];
		this.result = [];
		this.index = 0;
		this.loadedCount = 0;
		this.length = 0;
		this.leaveCount = 0;
		if (typeof callback === "function") {
			this.callback = callback;
		} else if (typeof connection === "function") {
			this.callback = connection;
		}
		if (typeof callback === "number") {
			this.maxConnection = connection;
		} else if (typeof connection === "number") {
			this.maxConnection = connection;
		} else {
			this.maxConnection = 5;
		}
		var self = this;
		this.loadedHandler = function (e) {
			self.loaded(e.target);
		};
		this.errorHandler = function (e) {
			self._error(e);
		};
		window.setTimeout(function () {
			self.init();
		}, 0);
	};
	Preload.prototype = Object.create(cavy.EventDispatcher.prototype);
	Preload.prototype.constructor = Preload;
	/**
	 * 初期化
	 * @private
	 */
	Preload.prototype.init = function () {
		var max = this.maxConnection;
		this.keys = Object.keys(this.data);
		this.length = this.keys.length;
		if (max > this.length) {
			max = this.length;
		}
		this.leaveCount = this.length - max;
		this.index = max;
		for (var i = 0; i < max; i++) {
			this.load(i);
		}
	};
	/**
	 * 画像読み込み完了時処理
	 * @private
	 * @param img
	 */
	Preload.prototype.loaded = function (img) {
		++this.loadedCount;
		this.dispatchEvent("step", img);
		img.removeEventListener("load", this.loadedHandler);
		img.removeEventListener("error", this.errorHandler);
		this.result[img.id] = img;
		if (this.loadedCount === this.length) {
			this.dispatchEvent("complete", this.result);
			if (typeof this.callback === "function") {
				this.callback(this.result);
			}
		} else if (this.leaveCount !== 0) {
			this.leaveCount--;
			this.load(this.index++);
		}
	};
	/**
	 * 指定インデックスの画像読み込み開始
	 * @private
	 * @param i
	 */
	Preload.prototype.load = function (i) {
		var img = new Image();
		img.id = this.keys[i];
		img.addEventListener("load", this.loadedHandler);
		img.addEventListener("error", this.errorHandler);
		img.src = this.data[this.keys[i]];
		if (img.complete) {
			this.loaded(img);
		}
	};
	/**
	 * エラー発生
	 * @private
	 * @param e
	 * @returns {*}
	 */
	Preload.prototype._error = function (e) {
		this.trigger("error", e);
		return this;
	};
	/**
	 * 読み込んだ画像を取得する
	 * @public
	 * @param id
	 * @returns {ImageElement}
	 */
	Preload.prototype.get = function (id) {
		return this.result[id];
	};

	/**
	 * 読み込みエラー時に行う処理を追加
	 * @public
	 * @param callback
	 * @returns {*}
	 */
	Preload.prototype.error = function (callback) {
		var errorFunction = function () {
			this.removeEventListener("error", errorFunction);
			callback.apply(this, [arguments]);
		};
		this.addEventListener("error", errorFunction);
		return this;
	};
	/**
	 * 読み込み完了時に行う処理を追加
	 * @public
	 * @param callback
	 * @returns {*}
	 */
	Preload.prototype.complete = function (callback) {
		var completeFunction = function () {
			this.removeEventListener("complete", completeFunction);
			callback.apply(this, [arguments]);
		};
		this.addEventListener("complete", completeFunction);
		return this;
	};
	/**
	 * すべてのイメージデータをクリア
	 * @public
	 */
	Preload.prototype.destroy = function () {
		delete this.result;
		delete this.data;
		this.result = [];
	};
	cavy.Preload = Preload;
})(window);
/*
 * Matrix2D
 * Visit http://createjs.com/ for documentation, updates and examples.
 *
 * Copyright (c) 2010 gskinner.com, inc.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * Represents an affine transformation matrix, and provides tools for constructing and concatenating matrixes.
	 * @alias cavy.Matrix2D
	 * @constructor
	 * @param {Number} a Specifies the a property for the new matrix.
	 * @param {Number} b Specifies the b property for the new matrix.
	 * @param {Number} c Specifies the c property for the new matrix.
	 * @param {Number} d Specifies the d property for the new matrix.
	 * @param {Number} tx Specifies the tx property for the new matrix.
	 * @param {Number} ty Specifies the ty property for the new matrix.
	 **/
	var Matrix2D = function (a, b, c, d, tx, ty, op) {
		this.a = 1;
		this.b = 0;
		this.c = 0;
		this.d = 1;
		this.e = 0;
		this.f = 0;
		this.opacity = 1;
		this.initialize(a, b, c, d, tx, ty, op);
	};
	/**
	 * An identity matrix, representing a null transformation. Read-only.
	 * @property identity
	 * @static
	 * @type Matrix2D
	 **/
	Matrix2D.identity = null; // set at bottom of class definition.
	/**
	 * Multiplier for converting degrees to radians. Used internally by Matrix2D. Read-only.
	 * @property DEG_TO_RAD
	 * @static
	 * @final
	 * @type Number
	 **/
	Matrix2D.DEG_TO_RAD = Math.PI / 180;
	Matrix2D.prototype = {
		// static public properties:
		constructor: Matrix2D,
		// public properties:
		/**
		 * Position (0, 0) in a 3x3 affine transformation matrix.
		 * @property a
		 * @type Number
		 **/
		a: 1,
		/**
		 * Position (0, 1) in a 3x3 affine transformation matrix.
		 * @property b
		 * @type Number
		 **/
		b: 0,
		/**
		 * Position (1, 0) in a 3x3 affine transformation matrix.
		 * @property c
		 * @type Number
		 **/
		c: 0,
		/**
		 * Position (1, 1) in a 3x3 affine transformation matrix.
		 * @property d
		 * @type Number
		 **/
		d: 1,
		/**
		 * Position (2, 0) in a 3x3 affine transformation matrix.
		 * @property tx
		 * @type Number
		 **/
		e: 0,
		/**
		 * Position (2, 1) in a 3x3 affine transformation matrix.
		 * @property ty
		 * @type Number
		 **/
		f: 0,
		/**
		 * Property representing the alpha that will be applied to a display object. This is not part of matrix
		 * operations, but is used for operations like getConcatenatedMatrix to provide concatenated alpha values.
		 * @property alpha
		 * @type Number
		 **/
		opacity: 1,
		// constructor:
		/**
		 * Initialization method.
		 * @protected
		 * @return {Matrix2D} This matrix. Useful for chaining method calls.
		 */
		initialize: function (a, b, c, d, tx, ty, op) {
			if (a != null) {
				this.a = a;
			}
			this.b = b || 0;
			this.c = c || 0;
			if (d != null) {
				this.d = d;
			}
			this.e = tx || 0;
			this.f = ty || 0;
			this.opacity = isNaN(op) ? 1 : op;
			return this;
		},
		// public methods:
		/**
		 * Concatenates the specified matrix properties with this matrix. All parameters are required.
		 * @param {Number} a
		 * @param {Number} b
		 * @param {Number} c
		 * @param {Number} d
		 * @param {Number} tx
		 * @param {Number} ty
		 * @return {Matrix2D} This matrix. Useful for chaining method calls.
		 **/
		prepend: function (a, b, c, d, tx, ty) {
			var tx1 = this.e;
			if (a !== 1 || b !== 0 || c !== 0 || d !== 1) {
				var a1 = this.a, c1 = this.c;
				this.a = a1 * a + this.b * c;
				this.b = a1 * b + this.b * d;
				this.c = c1 * a + this.d * c;
				this.d = c1 * b + this.d * d;
			}
			this.e = tx1 * a + this.f * c + tx;
			this.f = tx1 * b + this.f * d + ty;
			return this;
		},
		/**
		 * Appends the specified matrix properties with this matrix. All parameters are required.
		 * @param {Number} a
		 * @param {Number} b
		 * @param {Number} c
		 * @param {Number} d
		 * @param {Number} tx
		 * @param {Number} ty
		 * @return {Matrix2D} This matrix. Useful for chaining method calls.
		 **/
		append: function (a, b, c, d, tx, ty) {
			var a1 = this.a, b1 = this.b, c1 = this.c, d1 = this.d;
	
			this.a = a * a1 + b * c1;
			this.b = a * b1 + b * d1;
			this.c = c * a1 + d * c1;
			this.d = c * b1 + d * d1;
			this.e = tx * a1 + ty * c1 + this.e;
			this.f = tx * b1 + ty * d1 + this.f;
			return this;
		},
		/**
		 * Prepends the specified matrix with this matrix.
		 * @param {Matrix2D} matrix
		 **/
		prependMatrix: function (matrix) {
			this.prepend(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
			return this;
		},
		/**
		 * Appends the specified matrix with this matrix.
		 * @param {Matrix2D} matrix
		 * @return {Matrix2D} This matrix. Useful for chaining method calls.
		 **/
		appendMatrix: function (matrix) {
			this.append(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
			return this;
		},
		/**
		 * Generates matrix properties from the specified display object transform properties, and prepends them with this matrix.
		 * For example, you can use this to generate a matrix from a display object: var mtx = new Matrix2D();
		 * mtx.prependTransform(o.x, o.y, o.scaleX, o.scaleY, o.rotation);
		 * @param {Number} x
		 * @param {Number} y
		 * @param {Number} scaleX
		 * @param {Number} scaleY
		 * @param {Number} rotation
		 * @param {Number} skewX
		 * @param {Number} skewY
		 * @param {Number} regX Optional.
		 * @param {Number} regY Optional.
		 * @return {Matrix2D} This matrix. Useful for chaining method calls.
		 **/
		prependTransform: function (x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
			var cos = 1, sin = 0;
			if (rotation % 360) {
				var r = rotation * Matrix2D.DEG_TO_RAD;
				cos = Math.cos(r);
				sin = Math.sin(r);
			}
	
			if (regX || regY) {
				// append the registration offset:
				this.e -= regX;
				this.f -= regY;
			}
			if (skewX || skewY) {
				// TODO: can this be combined into a single prepend operation?
				skewX *= Matrix2D.DEG_TO_RAD;
				skewY *= Matrix2D.DEG_TO_RAD;
				this.prepend(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);
				this.prepend(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
			} else {
				this.prepend(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, x, y);
			}
			return this;
		},
		/**
		 * Generates matrix properties from the specified display object transform properties, and appends them with this matrix.
		 * For example, you can use this to generate a matrix from a display object: var mtx = new Matrix2D();
		 * mtx.appendTransform(o.x, o.y, o.scaleX, o.scaleY, o.rotation);
		 * @param {Number} x
		 * @param {Number} y
		 * @param {Number} scaleX
		 * @param {Number} scaleY
		 * @param {Number} rotation
		 * @param {Number} skewX
		 * @param {Number} skewY
		 * @param {Number} regX Optional.
		 * @param {Number} regY Optional.
		 * @return {Matrix2D} This matrix. Useful for chaining method calls.
		 **/
		appendTransform: function (x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
			var cos = 1, sin = 0;
			if (rotation % 360) {
				var r = rotation * Matrix2D.DEG_TO_RAD;
				cos = Math.cos(r);
				sin = Math.sin(r);
			}
	
			if (skewX || skewY) {
				// TODO: can this be combined into a single append?
				skewX *= Matrix2D.DEG_TO_RAD;
				skewY *= Matrix2D.DEG_TO_RAD;
				this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
				this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);
			} else {
				this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, x, y);
			}
	
			if (regX || regY) {
				// prepend the registration offset:
				this.e -= regX * this.a + regY * this.c;
				this.f -= regX * this.b + regY * this.d;
			}
			return this;
		},
		/**
		 * Applies a rotation transformation to the matrix.
		 * @param {Number} angle The angle in radians. To use degrees, multiply by <code>Math.PI/180</code>.
		 * @return {Matrix2D} This matrix. Useful for chaining method calls.
		 **/
		rotate: function (angle) {
			angle *= Matrix2D.DEG_TO_RAD;
			var cos = Math.cos(angle), sin = Math.sin(angle), a1 = this.a, c1 = this.c, tx1 = this.e;
	
			this.a = a1 * cos - this.b * sin;
			this.b = a1 * sin + this.b * cos;
			this.c = c1 * cos - this.d * sin;
			this.d = c1 * sin + this.d * cos;
			this.e = tx1 * cos - this.f * sin;
			this.f = tx1 * sin + this.f * cos;
			return this;
		},
		/**
		 * Applies a skew transformation to the matrix.
		 * @param {Number} skewX The amount to skew horizontally in degrees.
		 * @param {Number} skewY The amount to skew vertically in degrees.
		 * @return {Matrix2D} This matrix. Useful for chaining method calls.
		 */
		skew: function (skewX, skewY) {
			skewX = skewX * Matrix2D.DEG_TO_RAD;
			skewY = skewY * Matrix2D.DEG_TO_RAD;
			this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), 0, 0);
			return this;
		},
		/**
		 * Applies a scale transformation to the matrix.
		 * @param {Number} x The amount to scale horizontally
		 * @param {Number} y The amount to scale vertically
		 * @return {Matrix2D} This matrix. Useful for chaining method calls.
		 **/
		scale: function (x, y) {
			this.a *= x;
			this.d *= y;
			this.c *= x;
			this.b *= y;
			this.e *= x;
			this.f *= y;
			return this;
		},
		/**
		 * Translates the matrix on the x and y axes.
		 * @param {Number} x
		 * @param {Number} y
		 * @return {Matrix2D} This matrix. Useful for chaining method calls.
		 **/
		translate: function (x, y) {
			this.e += x;
			this.f += y;
			return this;
		},
		/**
		 * Sets the properties of the matrix to those of an identity matrix (one that applies a null transformation).
		 * @return {Matrix2D} This matrix. Useful for chaining method calls.
		 **/
		identity: function () {
			this.a = this.d = this.opacity = 1;
			this.b = this.c = this.e = this.f = 0;
			return this;
		},
		/**
		 * Inverts the matrix, causing it to perform the opposite transformation.
		 * @return {Matrix2D} This matrix. Useful for chaining method calls.
		 **/
		invert: function () {
			var a1 = this.a, b1 = this.b, c1 = this.c, d1 = this.d, tx1 = this.e, n = a1 * d1 - b1 * c1;
			this.a = d1 / n;
			this.b = -b1 / n;
			this.c = -c1 / n;
			this.d = a1 / n;
			this.e = (c1 * this.f - d1 * tx1) / n;
			this.f = -(a1 * this.f - b1 * tx1) / n;
			return this;
		},
		/**
		 * Returns true if the matrix is an identity matrix.
		 * @return {Boolean}
		 **/
		isIdentity: function () {
			return this.e === 0 && this.f === 0 && this.a === 1 && this.b === 0 && this.c === 0 && this.d === 1;
		},
		/**
		 * Decomposes the matrix into transform properties (x, y, scaleX, scaleY, and rotation). Note that this these values
		 * may not match the transform properties you used to generate the matrix, though they will produce the same visual
		 * results.
		 * @param {Object} target The object to apply the transform properties to. If null, then a new object will be returned.
		 * @return {Matrix2D} This matrix. Useful for chaining method calls.
		 */
		decompose: function (target) {
			// TODO: it would be nice to be able to solve for whether the matrix can be decomposed into only scale/rotation
			// even when scale is negative
			if (target == null) {
				target = {};
			}
			target.x = this.e;
			target.y = this.f;
			target.scaleX = Math.sqrt(this.a * this.a + this.b * this.b);
			target.scaleY = Math.sqrt(this.c * this.c + this.d * this.d);
	
			var skewX = Math.atan2(-this.c, this.d),
				skewY = Math.atan2(this.b, this.a);
	
			if (skewX == skewY) {
				target.rotation = skewY / Matrix2D.DEG_TO_RAD;
				if (this.a < 0 && this.d >= 0) {
					target.rotation += (target.rotation <= 0) ? 180 : -180;
				}
				target.skewX = target.skewY = 0;
			} else {
				target.skewX = skewX / Matrix2D.DEG_TO_RAD;
				target.skewY = skewY / Matrix2D.DEG_TO_RAD;
			}
			return target;
		},
		/**
		 * Returns a clone of the Matrix2D instance.
		 * @return {Matrix2D} a clone of the Matrix2D instance.
		 **/
		clone: function () {
			return new Matrix2D(this.a, this.b, this.c, this.d, this.e, this.f, this.opacity);
		},
		/**
		 * Returns a string representation of this object.
		 * @return {String} a string representation of the instance.
		 **/
		toString: function () {
			return "matrix(" + this.a + "," + this.b + "," + this.c + "," + this.d + "," + this.e + "," + this.f + ")";
		},
        toString3D: function() {
            return "matrix3d(" + this.a + "," + this.b + ",0,0," + this.c + "," + this.d + ",0,0,0,0,1,0," + this.e + "," + this.f + ",0,1)";
        }
	};
	// this has to be populated after the class is defined:
	Matrix2D.identity = new Matrix2D(1, 0, 0, 1, 0, 0);
	cavy.Matrix2D = Matrix2D;
})(window);
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * タイマークラス
	 * @constructor
	 * @alias cavy.Timer
	 * @example
	 *  var t = cavy.Timer.repeat(function(){},1000);    //1000ms毎に繰り返し
	 *  cavy.Timer.stop(t);    //タイマー停止
	 *  cavy.Timer.repeat(function(){});    //フレーム毎に繰り返し
	 *  cavy.Timer.repeat(function(){},1000,3);    //1000ms毎に３回繰り返し
	 *  cavy.Timer.delay(function(){},0,3);    //フレーム毎に３回繰り返し
	 **/
	var Timer = function () {
		this.isTick = false;
		this.repeats = [];
		this.time = 0;
		this.timer = null;
		var self = this;
		this._loopHandler = function () {
			self.update();
		};
	};
	Timer.prototype = {
		constructor: Timer,
		/**
		 * フレーム毎に行う処理
		 * @private
		 * @param t {Number} 経過時間（ミリ秒
		 * @return {void}
		 **/
		update: function () {
			var t = Date.now(),
				d = null,
				r = this.repeats.slice(0),
				l = this.repeats.length;

			this.time = t;
			while (l--) {
				d = r[l];
				if (d && t - d.time >= d.delay) {
					if (!isNaN(d.count)) {
						--d.count;
						if (d.count === 0) {
							this.repeats.splice(l, 1);
						}
						d.cacheCount -= d.count;
					}
					d.callback(t - d.timeStamp, t - d.time, d.count);
					d.time = t;
				}
			}
			this.timer = window.requestAnimationFrame(this._loopHandler);
		},
		/**
		 * 繰り返し処理
		 * @public
		 * @param callback {Function} 実行する処理
		 * @param delay {Number} インターバル時間
		 * @param count {Int} 繰り返し回数
		 * @return {TimerObject} タイマーオブジェクト
		 **/
		repeat: function (callback, delay, count) {
			var t = new TimerObject(this.time, callback, delay, count);
			this.repeats.push(t);
			this.play();
			return t;
		},
		/**
		 * 遅延処理
		 * @public
		 * @param callback {Function} 実行する処理
		 * @param delay {Number} 遅延時間
		 * @return {TimerObject} タイマーオブジェクト
		 **/
		delay: function (callback, delay) {
			var t = new TimerObject(this.time, callback, Math.floor(delay), 1);
			this.repeats.push(t);
			this.play();
			return t;
		},
		play: function () {
			if (!this.isTick) {
				this.isTick = true;
				this.update();
			}
			return this;
		},
		/**
		 * 遅延処理
		 * @public
		 * @param timerObject {TimerObject} タイマーオブジェクト
		 * @return {void}
		 **/
		stop: function (timerObject) {
			var index = this.repeats.indexOf(timerObject);
			if (index !== -1) {
				this.repeats.splice(index, 1);
			}
			if (this.repeats.length === 0) {
				window.cancelAnimationFrame(this.timer);
				this.isTick = false;
			}
			return this;
		},
		stopAll: function() {
			if (this.timer) {
				window.cancelAnimationFrame(this.timer);
				this.isTick = false;
			}
			return this;
		}
	};
	cavy.Timer = new Timer();

	/**
	 * タイマーオブジェクト
	 * @constructor
	 * @alias cavy.TimerObject
	 * @param index {Number} タイマーインデックス
	 * @param time {Number} 現在時間
	 * @param callback {Function} 実行処理
	 * @param delay {Number} ディレイ
	 * @param count {Int} 繰り返し数
	 **/
	var TimerObject = function (time, callback, delay, count) {
		this.time = time || 0;
		this.timeStamp = time || Date.now();
		this.callback = callback || function () {
		};
		this.delay = delay || 0;
		this.count = count || NaN;
		this.cacheCount = count || 0;
	};
	TimerObject.prototype = {
		/**
		 * タイマー停止
		 * @public
		 * @return {void}
		 **/
		stop: function () {
			cavy.Timer.stop(this);
		},
		play: function() {
			cavy.Timer.repeats.push(this);
		}
	};
	cavy.TimerObject = TimerObject;
})(window);
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * タイムラインオブジェクトクラス
	 * @constructor
	 * @alias cavy.Timeline
	 * @augments cavy.EventDispatcher
	 * @param frameCount {Int} 必要なフレーム数（先に定義しておくとパフォーマンスUP）
	 * @example
	 *  var t = new cavy.Timeline(1000);
	 *  t.addLabel(0,"start",function(){});
	 *  t.addLabel(1000,"end",function(){});
	 *  t.add("start", function() {});
	 *  t.add(1000,function() {});
	 *  t.play();
	 *  t.gotoAndStop("end");
	 *  t.gotoAndPlay("start");
	 *  t.stop();
	 **/
	var Timeline = function (frameCount) {
		if (frameCount) {
			this.queue = new Array(frameCount);
		} else {
			this.queue = [];
		}
		/**
		 * ラベル
		 * @type {}
		 */
		this.labels = {};
		/**
		 * 現在フレーム数
		 * @type {number}
		 */
		this.frame = 0;
		/**
		 * タイマー
		 * @private
		 * @type {TimerId}
		 */
		this.timer = null;
		/**
		 * 現在時間
		 * @type {number}
		 */
		this.time = 0;
		/**
		 * 経過時間
		 * @type {number}
		 */
		this.passedTime = 0;
		var self = this;
		this._enterframeHandler = function () {
			self._tick();
			self.frame++;
		};
		cavy.EventDispatcher.apply(this);
	};
	Timeline.prototype = Object.create(cavy.EventDispatcher.prototype);
	Timeline.prototype.constructor = Timeline;

	/**
	 * ミリ秒
	 * @contant
	 * @default 1000
	 * @type {number}
	 */
	Timeline.prototype.SECOND = 1000;
	/**
	 * フレームにイベントを追加
	 * @public
	 * @param frame {Number|String} フレーム数またはラベル名
	 * @param callback {Function} 指定フレーム時に実行する処理
	 * @return {void}
	 **/
	Timeline.prototype.add = function (frame, callback) {
		if (typeof frame === "string") {
			var f = this.labels[frame];
			if (isNaN(f)) {
				window.console.error("Not found label [" + frame + "]");
				return;
			}
			frame = f;
		}
		frame = Math.round(frame / (this.SECOND / cavy.frameRate));
		if (typeof this.queue[frame] === "object") {
			this.queue[frame].push(callback);
		} else {
			this.queue[frame] = [callback];
		}
		return this;
	};
	/**
	 * ラベルを追加
	 * @public
	 * @param frame {Number} フレーム数
	 * @param name {String} ラベル名
	 * @param callback {Function} 指定フレーム時に実行する処理
	 * @return {void}
	 **/
	Timeline.prototype.addLabel = function (frame, name, callback) {
		this.labels[name] = frame;
		if (callback) {
			this.add(frame, callback);
		}
	};
	/**
	 * ラベルを削除
	 * @public
	 * @param name {String} ラベル名
	 * @return {void}
	 **/
	Timeline.prototype.removeLabel = function (name) {
		delete this.labels[name];
	};
	/**
	 * フレームイベントを削除
	 * @public
	 * @param frame {Number} フレーム数
	 * @return {void}
	 **/
	Timeline.prototype.remove = function (frame, callback) {
		var q = this.queue[frame];
		if (q) {
			var i = q.indexOf(callback);
			if (i !== -1) {
				q.splice(i, 1);
			}
		}
		return this;
	};
	/**
	 * タイムライン開始
	 * @public
	 * @return {void}
	 **/
	Timeline.prototype.play = function () {
		this.stop();
		this.time = Date.now();
		this.timer = cavy.Timer.repeat(this._enterframeHandler);
		return this;
	};
	/**
	 * タイムライン停止
	 * @public
	 * @return {void}
	 **/
	Timeline.prototype.stop = function () {
		cavy.Timer.stop(this.timer);
		return this;
	};
	/**
	 * 指定フレームへ移動しタイムラインを開始
	 * @public
	 * @param frame {Number|String} フレーム数またはラベル名
	 * @return {void}
	 **/
	Timeline.prototype.goToAndPlay = function (frame) {
		if (typeof frame === "string") {
			var f = this.labels[frame];
			if (isNaN(f)) {
				window.console.error("Not found label [" + frame + "]");
				return;
			}
			frame = f;
		}
		this.frame = Math.round(frame / (this.SECOND / cavy.frameRate));
		this.passedTime = Math.floor(this.frame * (this.SECOND / cavy.frameRate));
		this._tick();
		this.play();
	};
	/**
	 * 指定フレームへ移動しタイムラインを停止
	 * @public
	 * @param frame {Number|String} フレーム数またはラベル名
	 * @return {void}
	 **/
	Timeline.prototype.goToAndStop = function (frame) {
		if (typeof frame === "string") {
			var f = this.labels[frame];
			if (isNaN(f)) {
				window.console.error("Not found label [" + frame + "]");
				return;
			}
			frame = f;
		}
		this.frame = Math.round(frame / (Timeline.SECOND / cavy.Tween.frameRate));
		this.passedTime = Math.floor(this.frame * (this.SECOND / cavy.frameRate));
		this._tick();
		this.stop();
	};
	/**
	 * タイムラインをリセット
	 * @public
	 * @return {void}
	 **/
	Timeline.prototype.reset = function () {
		this.frame = 0;
		return this;
	};
	/**
	 * フレーム毎の処理
	 * @private
	 * @return {void}
	 **/
	Timeline.prototype._tick = function () {
		var t = Date.now(),
			lt = t - this.time;
		this.passedTime += lt;
		this.time = t;
		var frame = Math.floor(this.passedTime / (1000 / cavy.frameRate));
		if (frame - this.frame > cavy.maxSkip) {
			frame = this.frame + cavy.maxSkip;
		}
		var range = [this.frame, frame];
		this.frame = frame;
		for (var i = range[0]; i <= range[1]; i++) {
			if (this.frame !== frame) {
				break;
			}
			var f = this.queue[i];
			if (f && f.length !== 0) {
				var l = f.length;
				while (l--) {
					f[l].apply(this, [this.frame]);
				}
			}
		}
		if (this.frame > this.queue.length) {
			this.stop();
			this.dispatchEvent("complete");
			return;
		}

	};
	cavy.Timeline = Timeline;
})(window);

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
			if (q.count < q.frame) {
				q.count = Math.min(~~f, q.frame);
			}
		}
		var easing = Tween.Easing[q.easing];
		if (q.count > q.frame) {
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
		} else if (q.count === q.frame) {
			q.count++;
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
		if (q.count <= q.frame && this.stepCallback) {
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

(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * シーンイベント管理をするクラス
	 * @constructor
	 * @alias cavy.Scene
	 * @augments Object
	 * @param {Object} sceneData
	 * @example
	 *    var scene = new Scene([
	 *        function() {},
	 *        function() {}
	 *  ]);
	 *    scene.next();
	 *  //scene.go(0);
	 *  scene.prev();
	 *
	 *  var scene2 = new Scene();
	 *  scene2.add("start", function(){});
	 *  scene2.add("end", function(){});
	 *  scene2.go("start");
	 *
	 **/
	var Scene = function (sceneData) {
		this.scenes = [];
		this.scenesData = {};
		this.index = -1;
		var self = this;
		this.addHandler = function (id, callback) {
			self.add(id, callback);
		};
		this.removeHandler = function (id) {
			self.remove(id);
		};
		this.goHandler = function (id, param) {
			self.go(id, param);
		};
		this.selectHandler = function (index, param) {
			self.select(index, param);
		};
		this.nextHandler = function (param) {
			self.next(param);
		};
		this.prevHandler = function (param) {
			self.prev(param);
		};
		this.destroyHandler = function () {
			self.destroy();
		};
		this._initialize(sceneData);

		return {
			add: this.addHandler,
			remove: this.removeHandler,
			go: this.goHandler,
			select: this.selectHandler,
			next: this.nextHandler,
			prev: this.prevHandler,
			destroy: this.destroyHandler
		};
	};
	Scene.prototype = {
		constructor: Scene,
		/**
		 * 初期化
		 * @private
		 * @param {Object} sceneData
		 * @return {void}
		 **/
		_initialize: function (sceneData) {
			if (!sceneData) return;
			for (var key in sceneData) {
				this.add(key, sceneData[key]);
			}
		},
		/**
		 * シーンの追加
		 * @public
		 * @param {String} id シーンID
		 * @param {Function} callback 実行する処理
		 * @return {void}
		 **/
		add: function (id, callback) {
			this.scenes.push(id);
			this.scenesData[id] = callback;
		},
		/**
		 * シーンの削除
		 * @public
		 * @param {String} id シーンID
		 * @return {void}
		 **/
		remove: function (id) {
			delete this.scenes[id];
		},
		/**
		 * 指定シーンへ移動
		 * @public
		 * @param {String} id シーンID
		 * @param {Object} param 渡したい引数
		 * @return {void}
		 **/
		go: function (id, param) {
			if (typeof id === "string") {
				var f = this.scenesData[id];
				if (f) {
					this.index = this.scenes.indexOf(id);
					f(param, this.index);
				} else {
					window.error("Not found: Scene [" + id + "]");
				}
			} else {
				this.select(id, param);
			}
		},
		/**
		 * 指定インデックスのシーンへ移動
		 * @public
		 * @param {String} index シーンインデックス
		 * @param {Object} param 渡したい引数
		 * @return {void}
		 **/
		select: function (index, param) {
			var id = this.scenes[index];
			if (id) {
				this.index = index;
				this.scenesData[id](param, index);
			}
		},
		/**
		 * 次のシーンへ移動
		 * @public
		 * @param {Object} param 渡したい引数
		 * @return {void}
		 **/
		next: function (param) {
			var i = this.index + 1,
				id = this.scenes[i];
			if (id) {
				this.index = i;
				this.scenesData[id](param, i);
			}
		},
		/**
		 * 前のシーンへ移動
		 * @private
		 * @param {Object} param 渡したい引数
		 * @return {void}
		 **/
		prev: function (param) {
			var i = this.index - 1,
				id = this.scenes[i];
			if (id) {
				this.index = i;
				this.scenesData[id](param, i);
			}
		},
		/**
		 * シーンをすべて削除する
		 * @private
		 * @return {void}
		 **/
		destroy: function () {
			this.scenes = [];
			this.scenesData = {};
			this.index = -1;
		}
	};
	cavy.Scene = Scene;
})(window);
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

		/**
		 * イベント保持フラグ
		 * @private
		 * @type {boolean}
		 */
		this._interactive = false;

		/**
		 * データ保存用オブジェクト
		 * @type {object}
		 * @private
		 */
		this._pool = {};
		
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
		return cavy.Util.clone(this);
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
	DisplayObject.prototype.createCache = function () {
		var cache = this.cache || document.createElement("canvas"),
			ctx = cache.getContext("2d");
		this.cache = null;
		this.clearCanvas(ctx,cache.width,cache.height);
		cache.width = this.width * cavy.deviceRatio;
		cache.height = this.height * cavy.deviceRatio;
		if (cache.width === 0 && cache.height === 0) {
			this.cache = null;
			return;
		}
		this._drawCache([this], ctx);
		this.cache = cache;
		/*
		if (imageCache) {
			this.imageCache = this.imageCache || new Image();
			this.imageCache.src = cache.toDataURL();
			if (this.imageCache.src !== "data:,") {
				this.clearCanvas(ctx,cache.width,cache.height);
			}
		}
		*/
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
		var rect = this.getBoundingRect();
		for (; i < l; i++) {
			var s = c[i];
			if (!s.visible) { continue; }
			ctx.setTransform(cavy.deviceRatio, 0, 0, cavy.deviceRatio, -rect.left*cavy.deviceRatio, -rect.top*cavy.deviceRatio);
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
			mask.draw(ctx, true);
			ctx.clip();
		}
		
		if (this.filter) {
			ctx.globalCompositeOperation = this.filter;
		}
		ctx.globalAlpha = m.opacity;
		ctx.transform(m.a, m.b, m.c, m.d, m.e, m.f);
	};

	/**
	 * 任意のデータを保存
	 * @param key {string} 保存名
	 * @param value {*} 保存する値
	 * @returns {*} keyのみまたは引数がない場合は値を返却
	 */
	DisplayObject.prototype.data = function (key,value) {
		if (typeof key === "undefined") {
			return this._pool;
		} else if (typeof key === "string") {
			if (typeof value === "undefined") {
				return this._pool[key];
			} else {
				this._pool[key] = value;
			}
		} else {
			for (var prop in key) {
				this._pool[prop] = key[prop];
			}
		}
	};

	/**
	 * data関数で保存したデータを削除
	 * @param key 削除する保存データ名。引数を省略するとすべてのデータを削除します。
	 */
	DisplayObject.prototype.clearData = function (key) {
		if (!key) {
			this._pool = {};
		} else {
			delete this._pool[key];
		}
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
		this.opacity = 1;
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
			this.sy = obj.offsetY * this.height + obj.positionY;
			this.matrix = obj.matrix;
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
			this.matrix.identity();
			var op = obj.opacity;
			if (obj.parent) {
				this.matrix.appendMatrix(obj.parent.matrix);
				op *= obj.parent.matrix.opacity;
			}
			this.matrix.appendTransform(this.x, this.y, obj.scaleX, obj.scaleY, obj.rotation, obj.skewX, obj.skewY, this.width * obj.originX, this.height * obj.originY);
			this.matrix.opacity = op;
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
	DisplayObject.prototype.on = function(type, listener) {
		this._interactive = true;
		return cavy.EventDispatcher.prototype.on.apply(this,[type,listener]);
	};
	DisplayObject.prototype.off = function(type, listener) {
		var e = cavy.EventDispatcher.prototype.off.apply(this,[type,listener]);
		if (Object.keys(this.__store__).length === 0) {
			this._interactive = false;
		}
		return e;
	};
	cavy.DisplayObject = DisplayObject;
})(window);
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * イベントの発火対象かどうかや当たり判定を持つクラス
	 * @alias cavy.InteractiveObject
	 * @augments cavy.DisplayObject
	 * @param source {HTMLImageObject} イメージオブジェクト
	 * @param param {Object} 初期パラメータ
	 * @constructor
	 */
	var InteractiveObject = function (source, param) {
		cavy.DisplayObject.apply(this, [source, param]);
	};
	InteractiveObject.prototype = Object.create(cavy.DisplayObject.prototype);

	InteractiveObject.prototype.constructor = InteractiveObject;
	/**
	 * 指定した座標に要素があるかどうか
	 * @public
	 * @param x {Number} x
	 * @param y {Number} y
	 * @returns {boolean} 指定座標に要素があるかどうか
	 */
	InteractiveObject.prototype.hitTest = function (x, y) {
		if (this.mask) {
			var maskRect = this.mask.getBoundingRect();
			if (x >= maskRect.left && x <= maskRect.right && y >= maskRect.top && y <= maskRect.bottom) {
				return true;
			}
			return false;
		} else {
			var rect = this.getBoundingRect();
			if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
				return true;
			}
		}
		
		return false;
	};
	/**
	 * 指定オブジェクトと接触しているかどうか
	 * @param target {DisplayObject}
	 * @returns {boolean}
	 */
	InteractiveObject.prototype.hitTestObject = function (target) {
		var rectA = this.getBoundingRect(),
			rectB = target.getBoundingRect();
		if (this.mask && !detail) {
			rectA = this.mask.getBoundingRect();
		}
		if (target.mask && !detail) {
			rectB = this.mask.getBoundingRect();
		}
		return (rectA.left <= rectB.right && rectA.top <= rectB.bottom && rectA.right >= rectB.left && rectA.bottom >= rectB.top);
	};
	cavy.InteractiveObject = InteractiveObject;
})(window);
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
		if (cavy.retina) {
			cavy.deviceRatio = window.webkitDevicePixelRatio || window.devicePixelRatio || 1;
			style.width = this.width + "px";
			style.height = this.height + "px";
			
			this.width *= cavy.deviceRatio;
			this.height *= cavy.deviceRatio;
			this.canvas.width = this.width;
			this.canvas.height = this.height;
			this.context.scale(cavy.deviceRatio,cavy.deviceRatio);
		} else {
			this.canvas.width = this.width;
			this.canvas.height = this.height;
		}
		
		
		//Androidバグ対応 #transparentにすると１コマで消えちゃう
		if (!style.backgroundColor && cavy.isBuggyDevice("background")) {
			style.backgroundColor = cavy.backgroundColor;
		}
		
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
		if (cavy.isBuggyDevice("background")) {
			this.canvas.width = this.canvas.width;
			this.context.scale(cavy.deviceRatio,cavy.deviceRatio);
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
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * canvasに画像を配置するオブジェクトクラス
	 * @constructor
	 * @alias cavy.Graphic
	 * @augments cavy.InteractiveObject
	 * @param {Number} width 横幅
	 * @param {Number} height 高さ
	 * @param {Object} param 初期パラメータ
	 **/
	var Graphic = function (obj, param) {
		/**
		 * 背景色
		 * @type {string}
		 * @default "transparent"
		 */
		this.backgroundColor = "transparent";
		/**
		 * 線の太さ
		 * @type {string}
		 * @default null
		 */
		this.borderWidth = null;
		/**
		 * ボーダーカラー
		 * @type {string}
		 * @default "transparent"
		 */
		this.borderColor = "transparent";
		/**
		 * 背景イメージ
		 * @type {HTMLImageElement}
		 * @default null
		 */
		this.backgroundImage = null;
		/**
		 * 背景繰り返し
		 * @type {string}
		 * @default null
		 */
		this.backgroundRepeat = null;
		/**
		 * 処理キュー配列
		 * @type {Array}
		 */
		this.queue = [];
		cavy.InteractiveObject.apply(this, [obj, param]);
	};
	Graphic.prototype = Object.create(cavy.InteractiveObject.prototype);
	/**
	 * 角度からラジアンに変換する係数
	 * @private
	 * @type {number}
	 */
	Graphic.DEG_TO_RAD = Math.PI / 180;
	Graphic.prototype.constructor = Graphic;
	/**
	 * パスを書き出す
	 * @private
	 * @param ctx
	 * @param p
	 * @param m
	 */
	Graphic.prototype.drawPath = function (ctx, p, m, mask) {
		if (this.cache) {
			if (this.imageCache && this.imageCache.src !== "data:,") {
				ctx.drawImage(this.imageCache, 0, 0, this.imageCache.width, this.imageCache.height);
			} else {
				ctx.drawImage(this.cache, 0, 0, this.cache.width, this.cache.height);
			}
			return;
		}
		ctx.beginPath();
		if (mask) {
			//ctx.save();
			ctx.translate(p.x, p.y);
		}
		if (p && m) {
			if (this.backgroundImage) {
				var pattern = ctx.createPattern(this.backgroundImage, this.backgroundRepeat);
				ctx.fillStyle = pattern;
			} else if (typeof this.backgroundColor === "object") {
				ctx.fillStyle = this.backgroundColor.draw(ctx, p, m);
			} else {
				ctx.fillStyle = this.backgroundColor;
			}
		}
		var i = 0, l = this.queue.length;
		for (; i < l; i++) {
			var q = this.queue[i];
			ctx[q[0]].apply(ctx, q[1]);
		}
		ctx.lineWidth = this.borderWidth;
		ctx.strokeStyle = this.borderColor;
		ctx.stroke();
		ctx.fill();
		ctx.closePath();
		if (mask) {
			ctx.translate(-p.x, -p.y);
		}
	};

	/**
	 * 矩形を描く
	 * @public
	 * @param x {Number} x
	 * @param y {Number} y
	 * @param w {Number} width
	 * @param h {Number} height
	 */
	Graphic.prototype.rect = function (x, y, w, h) {
		this.queue.push(["rect", [x, y, w, h]]);
	};
	/**
	 * 塗りつぶされた矩形を描く
	 * @public
	 * @param x {Number} x
	 * @param y {Number} y
	 * @param w {Number} width
	 * @param h {Number} height
	 */
	Graphic.prototype.fillRect = function (x, y, w, h) {
		this.queue.push(["fillRect", [x, y, w, h]]);
	};
	/**
	 * 矩形の輪郭を描く
	 * @public
	 * @param x {Number} x
	 * @param y {Number} y
	 * @param w {Number} width
	 * @param h {Number} height
	 */
	Graphic.prototype.strokeRect = function (x, y, w, h) {
		this.queue.push(["strokeRect", [x, y, w, h]]);
	};
	/**
	 * 描画をクリアする
	 * @public
	 */
	Graphic.prototype.clear = function () {
		this.queue = [];
	};
	/**
	 * 矩形クリア
	 * @public
	 * @param x {Number} x
	 * @param y {Number} y
	 * @param w {Number} width
	 * @param h {Number} height
	 */
	Graphic.prototype.clearRect = function (x, y, w, h) {
		this.queue.push(["clearRect", [x, y, w, h]]);
	};
	/**
	 * 直線を引く
	 * @public
	 * @param x {Number} x
	 * @param y {Number} y
	 */
	Graphic.prototype.lineTo = function (x, y) {
		this.queue.push(["lineTo", [x, y]]);
	};
	/**
	 * 曲線を描く
	 * @public
	 * @param x1 {Number} x1
	 * @param y1 {Number} y1
	 * @param x2 {Number} x2
	 * @param y2 {Number} y2
	 * @param radius {Number} radius
	 */
	Graphic.prototype.arcTo = function (x1, y1, x2, y2, radius) {
		this.queue.push(["arcTo", [x1, y1, x2, y2, radius]]);
	};
	/**
	 * ベジェ曲線を描く
	 * @public
	 * @param x1 {Number} x1
	 * @param y1 {Number} y1
	 * @param x2 {Number} x2
	 * @param x2 {Number} y2
	 * @param centerX {Number} centerX
	 * @param centerY {Number} centerY
	 */
	Graphic.prototype.bezierCurveTo = function (x1, y1, x2, y2, centerX, centerY) {
		this.queue.push(["bezierCurveTo", [x1, y1, x2, y2, centerX, centerY]]);
	};
	/**
	 * 指定位置に書き出し位置を移動する
	 * @public
	 * @param x {Number} x
	 * @param y {Number} y
	 */
	Graphic.prototype.moveTo = function (x, y) {
		this.queue.push(["moveTo", [x, y]]);
	};
	/**
	 * 扇形を描く
	 * @public
	 * @param x {Number} x
	 * @param y {Number} y
	 * @param radius {Number} radius
	 * @param tilt {Number} tilt
	 * @param angle {Number} angle
	 */
	Graphic.prototype.fan = function (x, y, radius, tilt, angle) {
		this.moveTo(x, y);
		this.queue.push(["arc", [x, y, radius, ((tilt - 90) * Graphic.DEG_TO_RAD), (((tilt - 90) + angle) * Graphic.DEG_TO_RAD), false]]);
	};

	/**
	 * 円弧を描く
	 * @param x {Number} x
	 * @param y {Number} y
	 * @param radius {Number} radius
	 * @param startAngle {Number} angle
	 * @param endAngle {Number} angle
	 * @param anticlockwise {Boolean}
	 */
	Graphic.prototype.arc = function (x, y, radius, startAngle, endAngle, anticlockwise) {
		startAngle = startAngle * Graphic.DEG_TO_RAD;
		endAngle = endAngle * Graphic.DEG_TO_RAD;
		this.queue.push(["arc", [x, y, radius, startAngle, endAngle, anticlockwise]]);
	};
	cavy.Graphic = Graphic;
})(window);
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * BackgroundColor
	 * @alias cavy.BackgroundColor
	 * @constructor
	 */
	var BackgroundColor = function () {
	};
	BackgroundColor.prototype.constructor = BackgroundColor;
	/**
	 * @protected
	 * @returns {string} transparent
	 */
	BackgroundColor.prototype.draw = function () {
		return "transparent";
	};
	cavy.BackgroundColor = BackgroundColor;
})(window);
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * 線形グラデーションクラス
	 * @alias cavy.LinearGradient
	 * @augments cavy.BackgroundColor
	 * @param width {Number} 横幅
	 * @param height {Number} 高さ
	 * @constructor
	 */
	var LinearGradient = function (width, height) {
		this.x = 0;
		this.y = 0;
		this.width = width || null;
		this.height = height || null;
		this.steps = [];
	};
	LinearGradient.prototype = Object.create(cavy.BackgroundColor.prototype);
	LinearGradient.prototype.constructor = LinearGradient;
	/**
	 * グラデーションステップを追加
	 * @public
	 * @param step {Number} グラデーションステップ(0-1)
	 * @param color {String} 色(#000,black)
	 */
	LinearGradient.prototype.addStep = function (step, color) {
		this.steps.push([step, color]);
	};
	/**
	 * グラデーションを描画する
	 * @private
	 * @param ctx
	 * @returns {CanvasGradient}
	 */
	LinearGradient.prototype.draw = function (ctx) {
		var x = this.x || 0, y = this.y || 0,
			width = this.width || 0, height = this.height || 0,
			grad = ctx.createLinearGradient(x, y, width, height),
			l = this.steps.length,
			i = 0;
		for (; i < l; i++) {
			var s = this.steps[i];
			grad.addColorStop(s[0], s[1]);
		}
		return grad;
	};
	cavy.LinearGradient = LinearGradient;
})(window);
/**
 * @fileOverview CircleGradient
 **/
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * 円形グラデーション
	 * @alias cavy.CircleGradient
	 * @augments cavy.BackgroundColor
	 * @param x0 {Number} 中心点x
	 * @param y0 {Number} 中心点y
	 * @param r0 {Number} 半径
	 * @param x1 {Number} (option)第２中心点x
	 * @param y1 {Number} (option)第２中心点y
	 * @param r1 {Number} (option)第２半径
	 * @constructor
	 */
	var CircleGradient = function (x0, y0, r0, x1, y1, r1) {
		this.x0 = x0 || 0;
		this.y0 = y0 || 0;
		this.x1 = x0 || 0;
		this.y1 = y0 || 0;
		this.r0 = r0 || 0;
		this.r1 = r1 || 0;
		this.steps = [];
	};
	CircleGradient.prototype = Object.create(cavy.BackgroundColor.prototype);
	CircleGradient.prototype.constructor = CircleGradient;
	/**
	 * グラデーションステップを追加
	 * @public
	 * @param step {Number} グラデーションステップ(0-1)
	 * @param color {String} 色(#000,black)
	 */
	CircleGradient.prototype.addStep = function (step, color) {
		this.steps.push([step, color]);
	};
	/**
	 * グラデーション書き出し
	 * @private
	 * @param ctx {Context}
	 * @param p {Object} プロパティオブジェクト
	 * @param m {cavy.Matrix2D} Matrixオブジェクト
	 * @returns {CanvasGradient}
	 */
	CircleGradient.prototype.draw = function (ctx, p) {
		var grad = ctx.createRadialGradient(this.x0 + p.width / 2, this.y0 + p.height / 2, this.r0, this.x1 + p.width / 2, this.y1 + p.height / 2, this.r1);
		var l = this.steps.length;
		for (var i = 0; i < l; i++) {
			var s = this.steps[i];
			grad.addColorStop(s[0], s[1]);
		}
		return grad;
	};
	cavy.CircleGradient = CircleGradient;
})(window);
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * 図形を描画するクラス
	 * @alias cavy.Shape
	 * @augments cavy.Graphic
	 * @param w {Number} 横幅
	 * @param h {Number} 高さ
	 * @param param {Object} 初期パラメータ
	 * @constructor
	 */
	var Shape = function (w, h, param) {
		var obj = {
			width: w,
			height: h
		};
		cavy.Graphic.apply(this, [obj, param]);
	};
	Shape.prototype = Object.create(cavy.Graphic.prototype);
	Shape.prototype.constructor = Shape;
	/**
	 * 図形を描画
	 * @private
	 * @param ctx
	 */
	Shape.prototype.draw = function (ctx,mask) {
		if (!this.parent && !mask) {return;}
		var p = this.update(),
			m = this.matrix;
		this.updateContext(ctx);
		this.drawPath(ctx, p, m, mask);
	};
	cavy.Shape = Shape;
})(window);
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * canvasに矩形を配置するオブジェクトクラス
	 * @alias cavy.Rectangle
	 * @constructor
	 * @augments cavy.Graphic
	 * @param width {Number} 横幅
	 * @param height {Number} 高さ
	 * @param param {Object} 初期パラメータ
	 **/
	var Rectangle = function (w, h, param) {
		var obj = {
			width: w,
			height: h
		};
		cavy.Graphic.apply(this, [obj, param]);
	};
	Rectangle.prototype = Object.create(cavy.Graphic.prototype);
	Rectangle.prototype.constructor = Rectangle;
	/**
	 * 矩形を描画
	 * @private
	 * @param ctx
	 * @param mask
	 */
	Rectangle.prototype.draw = function (ctx, mask) {
        if (!this.parent && !mask) {return;}
		var p = this.update(),
			m = this.matrix;
		if (!mask) {
			this.updateContext(ctx);
		}
		this.rect(0, 0, p.innerWidth, p.innerHeight);
		this.drawPath(ctx, p, m, mask);
		this.queue = [];
	};
	cavy.Rectangle = Rectangle;
})(window);

(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * キャンバスに円を書き出すクラス
	 * @alias cavy.Circle
	 * @augments cavy.Graphic
	 * @param radius {Number} 半径
	 * @param startAngle {Number} 円開始角度
	 * @param endAngle {Number} 円終了角度
	 * @param anticlockwise {Boolean} 逆回り
	 * @param param {Object} 初期パラメーター
	 * @constructor
	 */
	var Circle = function (radius, startAngle, endAngle, anticlockwise, param) {
		/**
		 * 半径
		 * @type {number}
		 */
		this.radius = radius || 100;
		/**
		 * 開始角度
		 * @type {number}
		 */
		this.startAngle = startAngle || 0;
		/**
		 * 終了角度
		 * @type {number}
		 */
		this.endAngle = endAngle || 360;
		/**
		 * 反転フラグ
		 * @type {boolean}
		 */
		this.anticlockwise = this.anticlockwise || false;
		var obj = {
			width: radius * 2,
			height: radius * 2
		};
		cavy.Graphic.apply(this, [obj, param]);
	};
	Circle.prototype = Object.create(cavy.Graphic.prototype);
	Circle.prototype.constructor = Circle;
	/**
	 * 円を書き出す
	 * @private
	 * @param ctx {Context}
	 */
	Circle.prototype.draw = function (ctx,mask) {
		if (!this.parent && !mask) {return;}
		var p = this.update(),
			m = this.matrix;
		if (!mask) {
			this.updateContext(ctx);
		}
		this.arc(p.sx + this.radius, p.sy + this.radius, this.radius, this.startAngle, this.endAngle, this.anticlockwise);
		this.drawPath(ctx, p, m, mask);
		this.queue = [];
	};
	cavy.Circle = Circle;
})(window);
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
	 * @param cached {Boolean} キャッシュ描画かどうか
	 * @return {void}
	 **/
	Sprite.prototype.draw = function (ctx) {
		if (!this.parent) {return;}
		var p = this.update();
		this.updateContext(ctx);
		if (this.cache) {
			if (this.imageCache && this.imageCache.src !== "data:,") {
				ctx.drawImage(this.imageCache, 0, 0, p.width, p.height);
			} else {
				ctx.drawImage(this.cache, 0, 0, p.width, p.height);
			}
		} else if (this.source && this.source.width !== 0 && this.source.height !== 0) {
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
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * canvasにスプライト画像を配置するオブジェクトクラス
	 * @constructor
	 * @alias cavy.SpriteSheet
	 * @augments cavy.Sprite
	 * @param obj {Object} widthとheightを持つオブジェクト
	 * @param pattern {Object} スプライトアニメーションパターン
	 * @param param {Object} 初期パラメータ
	 * @example
	 *    var s = new SpriteSheet(img, {
	 *		walk: [0,0,3,2],	//(0,0)から3フレームを１回繰り返しアニメーションさせます
	 *		sample: [オフセットx,オフセットy,フレーム数,繰り返し回数]
	 *	});
	 **/
	var SpriteSheet = function (obj, pattern, param) {
		/**
		 * アニメーションパターン配列
		 * @type {*}
		 */
		this.pattern = pattern || [];
		/**
		 * アニメーションパターン名
		 * @type {string}
		 */
		this.sheet = null;
		/**
		 * 現在のフレーム
		 * @type {number}
		 */
		this.frame = 0;
		/**
		 * 現在の処理数
		 * @type {number}
		 */
		this.count = 0;
		/**
		 * アニメーション間隔
		 * @type {number}
		 */
		this.interval = 0;
		/**
		 * アニメーション方向
		 * @type {string}
		 * @default "horizontal"
		 */
		this.direction = "horizontal";
		/**
		 * タイマー
		 * @type {TimerID}
		 * @private
		 */
		this.timer = null;
		/**
		 * 処理行数
		 * @private
		 * @type {number}
		 */
		this.line = 0;
		var self = this;
		this._enterframeHandler = function () {
			self.enterframe();
		};
		cavy.Sprite.apply(this, [obj, param]);
	};
	SpriteSheet.prototype = Object.create(cavy.Sprite.prototype);
	SpriteSheet.prototype.constructor = SpriteSheet;
	/**
	 * スプライトアニメーション実行
	 * @public
	 * @return {void}
	 **/
	SpriteSheet.prototype.play = function () {
		this.timer = cavy.Timer.repeat(this._enterframeHandler, this.interval);
	};
	/**
	 * スプライトアニメーション停止
	 * @public
	 * @return {void}
	 **/
	SpriteSheet.prototype.stop = function () {
		cavy.Timer.stop(this.timer);
	};
	/**
	 * スプライトアニメーション フレーム毎の処理
	 * @private
	 * @return {void}
	 **/
	SpriteSheet.prototype.enterframe = function () {
		var pat = this.pattern[this.sheet];
		if (!pat) {
			return;
		}

		var x = pat[0], y = pat[1], l = pat[2], limit = pat[3];
		if (this.frame > l) {
			if (limit) {
				++this.count;
				if (this.count === limit) {
					this.stop();
					this.dispatchEvent("complete");
				}
			}
			this.line = 0;
			this.frame = 0;
		}

		var f = 0;
		if (this.direction === "horizontal") {
			var maxOffsetX = Math.floor(this.source.width / this.width);
			f = (this.line === 0) ? this.frame : this.frame - (this.line * maxOffsetX);
			if (f === maxOffsetX) {
				this.offsetX = 0;
				this.line += 1;
			} else {
				this.offsetX = f;
			}
			this.offsetY = this.line + y;
		} else {
			var maxOffsetY = Math.floor(this.source.height / this.height);
			f = (this.line === 0) ? this.frame : this.frame - (this.line * maxOffsetY);
			if (f === maxOffsetY) {
				this.offsetY = 0;
				this.line += 1;
			} else {
				this.offsetY = f;
			}
			this.offsetX = this.line + x;
		}
		this.frame++;
	};
	cavy.SpriteSheet = SpriteSheet;
})(window);
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
	Text.prototype.draw = function (ctx) {
		if (!this.text || !this.parent) {
			return;
		}
		if (this.cache && !this._isClear) {
			this._draw(ctx);
		} else {
			this.drawText(ctx);
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
	Text.prototype.drawText = function(ctx) {
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