'use strict';

(function(window) {
	/**
	 * オブザーバークラス
	 * @param obj {Object} 監視対象オブジェクト
	 * @param callback {Function} 変更に行う処理
	 * @param watch {Boolean} 常に変更を監視するかどうかのフラグ
	 * @returns {Object} 監視用オブジェクト 
	 * @constructor
	 * 
	 * todo: 最終的にはObject.cloneと互換性を持たせたい
	 */
	var Observer = function (obj, key , callback) {
		if (typeof key === "function") {
			callback = key;
			key = null;
		}
		var clone;
		if (typeof key === "string") {
			var split = key.split(".");
			var tmp = obj;
			var key = "";
			var parent = obj;
			for (var i = 0,len = split.length; i < len; i++) {
				key = split[i];
				if (tmp[key]) {
					parent = tmp;
					tmp = tmp[key];
				} else {
					tmp = {};
					window.console.error("NotFound:" + key);
					break;
				}
			}
			if (typeof tmp === "object") {
				clone = Observer.clone(tmp);
			} else {
				var target = parent || obj;
				target.__cache__ = target.__cache || {};
				target.__cache__[key] = tmp;
				clone = this.registDefineProperty(target,key,callback, parent);
				return target;
			}
		} else if (typeof key === "object") {
			clone = Observer.clone(key);
		} else {
			clone = Observer.clone(obj);
		}
		clone = this.setDefineProperty(clone, callback, obj);
		return clone;
	};
	Observer.prototype = {
		/**
		 * getter/setterを定義する
		 * @param obj {Object}
		 * @param callback {Function} コールバック関数
		 * @returns {Object}
		 */
		setDefineProperty: function (obj, callback, parent) {
			var keys = Object.keys(obj);
			obj.__cache__ = {};
			obj.__callback__ = callback;
			parent = parent || obj;
			for (var i = 0, len = keys.length; i < len; i++) {
				var key = keys[i];
				obj.__cache__[key] = obj[key];
				if (Observer.isPlainObject(obj[key])) {
					this.setDefineProperty(obj[key], callback, parent);
				}
				this.registDefineProperty(obj,key,callback, parent);
			}
			return obj;
		},
		registDefineProperty: function(obj,key,callback ,parent) {
			Object.defineProperty(obj, key, {
				get: (function (key) {
					return function () {
						return this.__cache__[key];
					};
				})(key),
				set: (function (key) {
					return function (val) {
						var old = this.__cache__[key];
						var isChange = false;
						if (Observer.isPlainObject(old)) {
							if (Observer.isSameObject(old,val)) {
								isChange = true;
							}
						} else if (old !== val) {
							isChange = true;
						}
						if (isChange) {
							this.__cache__[key] = val;
							callback.apply(parent,[{
								type: "update",
								name: key,
								value: val,
								oldValue: old,
								object: this
							}]);
						}
					};
				})(key)
			});
		}
	};
	/**
	 * オブジェクトの複製
	 * @param obj {Object}
	 * @returns {Object}
	 */
	Observer.clone = function(obj) {
		return Observer.extend({}, obj);
	};
	/**
	 * オブジェクトの継承
	 * @param what {Object} 継承先
	 * @param wit {Object} 継承元
	 * @returns {Object}
	 */
	Observer.extend = function(target, source, deep) {
		for (var key in source) {
			if (deep && (Observer.isPlainObject(source[key]) || Observer.isArray(source[key]))) {
				if (Observer.isPlainObject(source[key]) && !Observer.isPlainObject(target[key])) {
					target[key] = {};
				}
				if (Observer.isArray(source[key]) && !Observer.isArray(target[key])) {
					target[key] = [];
					extend(target[key], source[key], deep)
				}
			} else if (source[key] !== undefined) {
				target[key] = source[key];
			}
		}
		return target;
	};
	/**
	 * Objectかどうかの判定
	 * @param obj {*}
	 * @returns {Boolean}
	 */
	Observer.isPlainObject = function(obj) {
		return (obj && typeof obj === "object" && obj !== obj.window && Object.getPrototypeOf(obj) === Object.prototype);
	};
	Observer.isArray = function(obj) {
		return obj instanceof Array;
	};
	Observer.isSameObject = function(obj1,obj2) {
		return (JSON.stringify(obj1) !== JSON.stringify(obj2));
	};
	window.Observer = window.Observer || Observer;
})(window);