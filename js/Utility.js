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
			var o;
			if (obj.constructor) {
				o = obj.constructor;
				o.prototype = obj.constructor.prototype;
				o = new o();
			} else {
				o = {};
			}
			o = Util.extend(o, obj);
			return o;
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