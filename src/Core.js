/**
 * @license Copyright 2013 TriFort.inc
 * cavy.js(http://trifort.jp/library/cavy)
 * version 0.0.1
 * MIT License
 * 
 * Matrix2D
 * Visit http://createjs.com/ for documentation, updates and examples.
 * Copyright (c) 2010 gskinner.com, inc.
 **/

/**
 * @fileOverview コアクラス
 * @version 0.0.1
 **/
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * requestAnimationFrame
	 * @public
	 * @type {Function}
	 */
	window.requestAnimationFrame = (function (window) {
		return window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
			(function () {
				var lastTime = Date.now();
				return function (callback) {
					var currTime = Date.now(), timeToCall = Math.max(0, 16 - (currTime - lastTime));
					lastTime = currTime + timeToCall;
					return window.setTimeout(callback, timeToCall);
				};
			})(window);
	})(window);
	/**
	 * cancelAnimationFrame
	 * @public
	 * @type {Function}
	 */
	window.cancelAnimationFrame = (function (window) {
		return window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.clearTimeout;
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
	 * Retina振り分けを自動で行う
	 * @public
	 * @default false
	 * @type {boolean}
	 */
	cavy.autoRetina = false;
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
	 * userAgent
	 * @public
	 * @default navigator.userAgent
	 * @type {string}
	 */
	cavy.userAgent = navigator.userAgent;
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
	 * canvasの背景色（色を何かしらつけないと一部のAndroid端末で描画されないバグがある）
	 * @default "rgba(255,255,255,0.01)"
	 * @type {string}
	 */
	cavy.backgroundColor = "rgba(255,255,255,0.01)";

    /**
     * アクセス端末に指定したバグがあるかどうか
     * @param type {string}
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
