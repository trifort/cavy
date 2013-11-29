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