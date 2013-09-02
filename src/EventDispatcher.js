/**
 * @fileOverview EventDispatcher
 * @version 0.0.1
 **/
(function (window) {
	"use strict";
	window.cavy = window.cavy || {};
	/**
	 * イベントの登録・発火を管理するクラス
	 * @alias cavy.EventDispatcher
	 * @constructor
	 **/
	var EventDispatcher = function () {
		this.__store__ = [];
	};
	EventDispatcher.prototype = {
		constructor: EventDispatcher,
		/**
		 * イベントを登録する
		 * @public
		 * @alias on
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
		 * @alias off
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
				this.__store__ = [];
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
		 * @alias trigger
		 * @param {String} type イベントタイプ
		 * @param {Object} イベント発火後の処理に渡す引数
		 * @param {Object} thisに設定するオブジェクト。省略するとEventDispatcherを設定します。
		 * @return {Boolean} イベントが登録されているかどうか
		 **/
		dispatchEvent: function (type, e, thisObj) {
			return this.trigger(type, e, thisObj);
		},
		/**
		 * 指定したイベントを発火
		 * @public
		 * @alias trigger
		 * @param {String} type イベントタイプ
		 * @param {Object} イベント発火後の処理に渡す引数
		 * @param {Object} thisに設定するオブジェクト。省略するとEventDispatcherを設定します。
		 * @return {Boolean} イベントが登録されているかどうか
		 **/
		trigger: function (type, e, thisObj) {
			var typeStore = this.__store__[type] || null;
			if (typeStore) {
				thisObj = thisObj || this;
				var args = Array.prototype.slice.apply(arguments, [1]);
				for (var i = 0, len = typeStore.length; i < len; i++) {
					typeStore[i].apply(thisObj, args);
				}
			}
			return this;
		}
	};
	cavy.EventDispatcher = EventDispatcher;
})(window);