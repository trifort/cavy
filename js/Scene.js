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